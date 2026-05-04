<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostController extends Controller
{
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
            'media.*'          => ['file', 'mimes:jpg,jpeg,png,gif,webp,mp4,mov', 'max:51200'],
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
                foreach ($request->file('media') as $index => $file) {
                    $path = $file->store('posts/' . $post->id, 'public');

                    PostMedia::create([
                        'post_id' => $post->id,
                        'url'     => $path,
                        'type'    => str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image',
                        'order'   => $index,
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
                Storage::disk('public')->delete($media->getRawOriginal('url'));
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
}