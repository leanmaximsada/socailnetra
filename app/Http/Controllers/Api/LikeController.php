<?php

namespace App\Http\Controllers\Api;

use App\Notifications\PostLikedNotification;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post): JsonResponse
    {
        $user     = $request->user();
        $existing = Like::where('user_id', $user->id)
                        ->where('post_id', $post->id)
                        ->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');

            return response()->json([
                'liked'       => false,
                'likes_count' => $post->likes_count,
            ]);
            
        }

        Like::create(['user_id' => $user->id, 'post_id' => $post->id]);
        $post->increment('likes_count');
        // Notify post owner (but not if they liked their own post)
if ($post->user_id !== $request->user()->id) {
    $post->user->notify(new PostLikedNotification($request->user(), $post));
}

        return response()->json([
            'liked'       => true,
            'likes_count' => $post->likes_count,
        ]);
    }

    public function index(Post $post): JsonResponse
    {
        $likes = $post->likes()
            ->with('user:id,name,username,avatar,is_verified')
            ->paginate(30);

        return response()->json($likes);
    }

    public function toggleComment(Request $request, Comment $comment): JsonResponse
    {
        $user  = $request->user();
        $pivot = DB::table('comment_likes')
            ->where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($pivot) {
            DB::table('comment_likes')
                ->where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->delete();

            $comment->decrement('likes_count');

            return response()->json([
                'liked'       => false,
                'likes_count' => $comment->likes_count,
            ]);
        }

        DB::table('comment_likes')->insert([
            'user_id'    => $user->id,
            'comment_id' => $comment->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $comment->increment('likes_count');

        return response()->json([
            'liked'       => true,
            'likes_count' => $comment->likes_count,
        ]);
    }
}