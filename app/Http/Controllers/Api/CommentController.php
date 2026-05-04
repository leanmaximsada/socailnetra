<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Notifications\PostCommentedNotification;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $comments = $post->comments()
            ->with([
                'user:id,name,username,avatar,is_verified',
                'replies.user:id,name,username,avatar',
            ])
            ->withCount('likes')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($comments);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        if ($post->disable_comments) {
            return response()->json(['message' => 'Comments are disabled'], 403);
        }

        $request->validate([
            'body'      => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ]);

        $comment = Comment::create([
            
            'user_id'   => $request->user()->id,
            'post_id'   => $post->id,
            'parent_id' => $request->parent_id,
            'body'      => $request->body,
        ]);

        if ($post->user_id !== $request->user()->id) {
    $post->user->notify(new PostCommentedNotification($request->user(), $post, $comment));
}

        $post->increment('comments_count');
        $comment->load('user:id,name,username,avatar,is_verified');

        return response()->json($comment, 201);
    }

    public function update(Request $request, Comment $comment): JsonResponse
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['body' => ['required', 'string', 'max:1000']]);
        $comment->update(['body' => $request->body]);

        return response()->json($comment);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        Post::where('id', $comment->post_id)->decrement('comments_count');

        return response()->json(['message' => 'Comment deleted']);
    }

    public function replies(Comment $comment): JsonResponse
    {
        $replies = $comment->replies()
            ->with('user:id,name,username,avatar,is_verified')
            ->withCount('likes')
            ->orderBy('created_at')
            ->paginate(10);

        return response()->json($replies);
    }
}