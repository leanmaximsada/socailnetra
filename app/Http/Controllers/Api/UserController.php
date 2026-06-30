<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function show(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->withCount(['posts', 'followers', 'following'])
            ->firstOrFail();

        $authUser    = $request->user();
        $isFollowing = $authUser->isFollowing($user);

        $followStatus = null;
        if ($isFollowing) {
            $followStatus = 'accepted';
        } else {
            $pending = DB::table('follows')
                ->where('follower_id', $authUser->id)
                ->where('following_id', $user->id)
                ->where('status', 'pending')
                ->exists();
            if ($pending) $followStatus = 'pending';
        }

        return response()->json([
            'user'          => $user,
            'is_following'  => $isFollowing,
            'follow_status' => $followStatus,
            'is_blocked'    => $user->hasBlocked($authUser),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => ['sometimes', 'string', 'max:100'],
            'username'   => ['sometimes', 'string', 'max:30',
                            'unique:users,username,' . $request->user()->id,
                            'regex:/^[a-zA-Z0-9_.]+$/'],
            'bio'        => ['nullable', 'string', 'max:150'],
            'website'    => ['nullable', 'url', 'max:100'],
            'location'   => ['nullable', 'string', 'max:50'],
            'is_private' => ['boolean'],
        ]);

        $request->user()->update($request->only(
            'name', 'username', 'bio', 'website', 'location', 'is_private'
        ));

        return response()->json($request->user()->fresh());
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => ['required', 'image', 'max:5120']]);

        $user = $request->user();

        // Delete old avatar from Cloudinary
        if ($user->avatar && str_starts_with($user->avatar, 'https://res.cloudinary.com')) {
            try {
                $publicId = $this->extractCloudinaryPublicId($user->avatar);
                cloudinary()->destroy($publicId);
            } catch (\Exception $e) {}
        }

        // Upload new avatar to Cloudinary
        $uploaded = cloudinary()->upload($request->file('avatar')->getRealPath(), [
            'folder'         => 'socialnetra/avatars',
            'transformation' => [
                'width'   => 400,
                'height'  => 400,
                'crop'    => 'fill',
                'gravity' => 'face',
            ],
        ]);

        $url = $uploaded->getSecurePath();
        $user->update(['avatar' => $url]);

        return response()->json(['avatar_url' => $url]);
    }

    public function updateCover(Request $request): JsonResponse
    {
        $request->validate(['cover' => ['required', 'image', 'max:10240']]);

        $user = $request->user();

        // Delete old cover from Cloudinary
        if ($user->cover_photo && str_starts_with($user->cover_photo, 'https://res.cloudinary.com')) {
            try {
                $publicId = $this->extractCloudinaryPublicId($user->cover_photo);
                cloudinary()->destroy($publicId);
            } catch (\Exception $e) {}
        }

        // Upload new cover to Cloudinary
        $uploaded = cloudinary()->upload($request->file('cover')->getRealPath(), [
            'folder'         => 'socialnetra/covers',
            'transformation' => [
                'width'  => 1200,
                'height' => 400,
                'crop'   => 'fill',
            ],
        ]);

        $url = $uploaded->getSecurePath();
        $user->update(['cover_photo' => $url]);

        return response()->json(['cover_url' => $url]);
    }

    public function posts(string $username): JsonResponse
    {
        $user  = User::where('username', $username)->firstOrFail();
        $posts = $user->posts()
            ->where('is_archived', false)
            ->where('type', '!=', 'reel')
            ->with(['media'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json($posts);
    }

    public function reels(string $username): JsonResponse
    {
        $user  = User::where('username', $username)->firstOrFail();
        $reels = $user->posts()
            ->where('type', 'reel')
            ->where('is_archived', false)
            ->with(['media'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json($reels);
    }

    public function suggested(Request $request): JsonResponse
    {
        $user         = $request->user();
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $suggested = User::whereNotIn('id', $followingIds)
            ->inRandomOrder()
            ->limit(10)
            ->get(['id', 'name', 'username', 'avatar', 'is_verified', 'followers_count']);

        return response()->json($suggested);
    }

    public function block(Request $request, User $user): JsonResponse
    {
        $request->user()->blocks()->syncWithoutDetaching([$user->id]);
        return response()->json(['message' => 'User blocked']);
    }

    public function unblock(Request $request, User $user): JsonResponse
    {
        $request->user()->blocks()->detach($user->id);
        return response()->json(['message' => 'User unblocked']);
    }

    private function extractCloudinaryPublicId(string $url): string
    {
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/';
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? '';
    }
}