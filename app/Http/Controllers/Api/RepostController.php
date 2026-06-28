<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Repost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepostController extends Controller
{
    public function toggle(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        $repost = Repost::where('user_id', $user->id)
                        ->where('post_id', $post->id)
                        ->first();

        if ($repost) {
            $repost->delete();
            return response()->json(['reposted' => false, 'reposts_count' => $post->reposts()->count()]);
        }

        Repost::create(['user_id' => $user->id, 'post_id' => $post->id]);
        return response()->json(['reposted' => true, 'reposts_count' => $post->reposts()->count()]);
    }

    public function userReposts(Request $request, string $username): JsonResponse
    {
        $user = \App\Models\User::where('username', $username)->firstOrFail();
        $reposts = Repost::where('user_id', $user->id)
            ->with(['post' => function($q) {
                $q->with(['user:id,name,username,avatar,is_verified', 'media'])
                  ->withCount(['likes', 'comments', 'reposts']);
            }])
            ->latest()
            ->paginate(12);

        return response()->json($reposts);
    }
}