<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Notifications\UserFollowedNotification;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    public function toggle(Request $request, User $user): JsonResponse
    {
        $follower = $request->user();

        if ($follower->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 422);
        }

        $existing = Follow::where('follower_id', $follower->id)
                          ->where('following_id', $user->id)
                          ->first();

        if ($existing) {
            $existing->delete();

            if ($existing->status === 'accepted') {
                $user->decrement('followers_count');
                $follower->decrement('following_count');
            }

            return response()->json(['following' => false, 'status' => null]);
        }

        $status = $user->is_private ? 'pending' : 'accepted';

       Follow::create([
    'follower_id'  => $follower->id,
    'following_id' => $user->id,
    'status'       => $status,
]);

if ($status === 'accepted') {
    $user->increment('followers_count');
    $follower->increment('following_count');
}

// 👇 Add this
if ($user->id !== $follower->id) {
    $user->notify(new UserFollowedNotification($follower));
}

return response()->json(['following' => true, 'status' => $status]);
        
    }

    public function followers(string $username): JsonResponse
    {
        $user      = User::where('username', $username)->firstOrFail();
        $followers = $user->followers()->paginate(30);

        return response()->json($followers);
    }

    public function following(string $username): JsonResponse
    {
        $user      = User::where('username', $username)->firstOrFail();
        $following = $user->following()->paginate(30);

        return response()->json($following);
    }

    public function requests(Request $request): JsonResponse
    {
        $requests = Follow::where('following_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('follower')
            ->paginate(20);

        return response()->json($requests);
    }

    public function accept(Request $request, Follow $follow): JsonResponse
    {
        if ($follow->following_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $follow->update(['status' => 'accepted']);
        $follow->follower->increment('following_count');
        $request->user()->increment('followers_count');

        return response()->json(['message' => 'Follow request accepted']);
    }

    public function decline(Request $request, Follow $follow): JsonResponse
    {
        if ($follow->following_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $follow->delete();

        return response()->json(['message' => 'Follow request declined']);
    }
}