<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use Illuminate\Http\JsonResponse;

class HashtagController extends Controller
{
    public function show(string $name): JsonResponse
    {
        $hashtag = Hashtag::where('name', strtolower($name))->firstOrFail();

        return response()->json($hashtag);
    }

    public function posts(string $name): JsonResponse
    {
        $hashtag = Hashtag::where('name', strtolower($name))->firstOrFail();

        $posts = $hashtag->posts()
            ->where('is_archived', false)
            ->with(['user:id,name,username,avatar,is_verified', 'media'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json($posts);
    }
}