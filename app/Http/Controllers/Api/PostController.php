<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\PostMedia;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    private function getCloudinary(): Cloudinary
    {
        return new Cloudinary(
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ],
                'url' => ['secure' => true],
            ])
        );
    }

    public function index(Request $request): JsonResponse
    {
        $posts = Post::where('user_id', $request->user()->id)
            ->with(['user', 'media'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'caption'          => ['nullable', 'string', 'max:2200'],
            'type'             => ['required', 'in:text,image,video,reel'],
            'location'         => ['nullable', 'string', 'max:100'],
            'disable_comments' => ['boolean'],
            'media'            => ['nullable', 'array', 'max:10'],
            'media.*'          => ['file', 'mimes:jpg,jpeg,png,gif,webp,mp4,mov,mp3,wav,ogg', 'max:102400'],
        ]);

        $post = DB::transaction(function () use ($request) {
            $post = Post::create([
                'user_id'          => $request->user()->id,
                'caption'          => $request->caption,
                'type'             => $request->type,
                'location'         => $request->location,
                'disable_comments' => $request->boolean('disable_comments'),
            ]);

            if ($request->hasFile('media')) {
                $cloudinary = $this->getCloudinary();

                foreach ($request->file('media') as $index => $file) {
                    $mimeType     = $file->getMimeType();
                    $isVideo      = str_starts_with($mimeType, 'video');
                    $isAudio      = str_starts_with($mimeType, 'audio');
                    $resourceType = ($isVideo || $isAudio) ? 'video' : 'image';

                    $result = $cloudinary->uploadApi()->upload(
                        $file->getRealPath(),
                        [
                            'folder'        => 'socialnetra/posts/' . $post->id,
                            'resource_type' => $resourceType,
                        ]
                    );

                    $url          = $result['secure_url'];
                    $thumbnailUrl = null;

                    if ($isVideo) {
                        $thumbnailUrl = str_replace('/upload/', '/upload/w_400,h_400,c_fill,so_0/', $url);
                        $thumbnailUrl = preg_replace('/\.[^.]+$/', '.jpg', $thumbnailUrl);
                    }

                    PostMedia::create([
                        'post_id'       => $post->id,
                        'url'           => $url,
                        'thumbnail_url' => $thumbnailUrl,
                        'type'          => $isVideo ? 'video' : ($isAudio ? 'audio' : 'image'),
                        'order'         => $index,
                    ]);
                }
            }

            if ($request->caption) {
                $this->syncHashtags($post, $request->caption);
            }

            $request->user()->increment('posts_count');

            return $post;
        });

        $post->load(['user', 'media', 'hashtags']);

        return response()->json($post, 201);
    }

    public function show(Post $post): JsonResponse
    {
        $post->load(['user', 'media', 'hashtags'])
             ->loadCount(['likes', 'comments']);

        $post->increment('views_count');

        return response()->json($post);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'caption'          => ['nullable', 'string', 'max:2200'],
            'location'         => ['nullable', 'string', 'max:100'],
            'disable_comments' => ['boolean'],
        ]);

        $post->update($request->only('caption', 'location', 'disable_comments'));

        if ($request->caption) {
            $this->syncHashtags($post, $request->caption);
        }

        return response()->json($post->load(['user', 'media']));
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($post, $request) {
            foreach ($post->media as $media) {
                try {
                    $cloudinary = $this->getCloudinary();
                    $publicId   = $this->extractCloudinaryPublicId($media->url);
                    $isVideo    = $media->type === 'video';
                    $cloudinary->uploadApi()->destroy($publicId, [
                        'resource_type' => $isVideo ? 'video' : 'image',
                    ]);
                } catch (\Exception $e) {}
            }
            $post->delete();
            $request->user()->decrement('posts_count');
        });

        return response()->json(['message' => 'Post deleted']);
    }

    public function archive(Request $request, Post $post): JsonResponse
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->update(['is_archived' => !$post->is_archived]);

        return response()->json(['is_archived' => $post->is_archived]);
    }

    private function syncHashtags(Post $post, string $caption): void
    {
        preg_match_all('/#(\w+)/u', $caption, $matches);
        $tags = array_unique(array_map('strtolower', $matches[1]));
        $ids  = [];

        foreach ($tags as $tag) {
            $hashtag = Hashtag::firstOrCreate(['name' => $tag]);
            $ids[]   = $hashtag->id;
        }

        $post->hashtags()->sync($ids);
    }

    private function extractCloudinaryPublicId(string $url): string
    {
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/';
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? '';
    }
}