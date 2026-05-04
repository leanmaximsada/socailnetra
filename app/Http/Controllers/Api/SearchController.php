<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:1', 'max:100']]);

        $q = $request->q;

        $users = User::where('username', 'ilike', "%{$q}%")
            ->orWhere('name', 'ilike', "%{$q}%")
            ->limit(10)
            ->get(['id', 'name', 'username', 'avatar', 'is_verified', 'followers_count']);

        $hashtags = Hashtag::where('name', 'ilike', "%{$q}%")
            ->orderByDesc('posts_count')
            ->limit(10)
            ->get(['id', 'name', 'posts_count']);

        return response()->json([
            'users'    => $users,
            'hashtags' => $hashtags,
        ]);
    }
}