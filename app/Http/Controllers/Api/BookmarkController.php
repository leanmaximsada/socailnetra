<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function toggle(Request $request, Post $post): JsonResponse
    {
        $result    = $request->user()->bookmarks()->toggle($post->id);
        $bookmarked = count($result['attached']) > 0;

        return response()->json(['bookmarked' => $bookmarked]);
    }

    public function index(Request $request): JsonResponse
    {
        $posts = $request->user()->bookmarks()
            ->with(['user:id,name,username,avatar,is_verified', 'media'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('bookmarks.created_at')
            ->paginate(12);

        return response()->json($posts);
    }
}