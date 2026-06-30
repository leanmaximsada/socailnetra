<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user         = $request->user();
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $stories = Story::whereIn('user_id', $followingIds)
            ->active()
            ->with('user:id,name,username,avatar,is_verified')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('user_id')
            ->map(function ($group) use ($user) {
                return [
                    'user'       => $group->first()->user,
                    'stories'    => $group->values(),
                    'has_unseen' => $group->contains(fn($s) =>
                        !$s->viewers()->where('user_id', $user->id)->exists()
                    ),
                ];
            })
            ->values();

        return response()->json($stories);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'media'        => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,mp4,mov', 'max:51200'],
            'text_overlay' => ['nullable', 'string', 'max:200'],
        ]);

        $file         = $request->file('media');
        $isVideo      = str_starts_with($file->getMimeType(), 'video');
        $resourceType = $isVideo ? 'video' : 'image';

        // Upload to Cloudinary
        $uploaded = cloudinary()->upload($file->getRealPath(), [
            'folder'        => 'socialnetra/stories',
            'resource_type' => $resourceType,
        ]);

        $url  = $uploaded->getSecurePath();
        $type = $isVideo ? 'video' : 'image';

        $story = Story::create([
            'user_id'      => $request->user()->id,
            'media_url'    => $url,
            'type'         => $type,
            'text_overlay' => $request->text_overlay,
            'expires_at'   => now()->addHours(24),
        ]);

        $story->load('user');

        return response()->json($story, 201);
    }

    public function destroy(Request $request, Story $story): JsonResponse
    {
        if ($story->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete from Cloudinary
        try {
            $url      = $story->getRawOriginal('media_url');
            $isVideo  = $story->type === 'video';
            $publicId = $this->extractCloudinaryPublicId($url);
            cloudinary()->destroy($publicId, ['resource_type' => $isVideo ? 'video' : 'image']);
        } catch (\Exception $e) {}

        $story->delete();

        return response()->json(['message' => 'Story deleted']);
    }

    public function markViewed(Request $request, Story $story): JsonResponse
    {
        $story->viewers()->syncWithoutDetaching([
            $request->user()->id => ['viewed_at' => now()]
        ]);
        $story->increment('views_count');

        return response()->json(['message' => 'Viewed']);
    }

    public function viewers(Request $request, Story $story): JsonResponse
    {
        if ($story->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $viewers = $story->viewers()
            ->get(['users.id', 'name', 'username', 'avatar']);

        return response()->json($viewers);
    }

    private function extractCloudinaryPublicId(string $url): string
    {
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/';
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? '';
    }
}