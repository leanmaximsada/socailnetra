<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $posts = Post::whereNotIn('user_id', $followingIds)
    ->where('is_archived', false)
    ->with(['user:id,name,username,avatar,is_verified', 'media'])
    ->withCount(['comments'])
    ->orderByDesc('posts.likes_count')
    ->paginate(30);

        return response()->json($posts);
    }

    public function trending(): JsonResponse
    {
        $hashtags = Hashtag::orderByDesc('posts_count')
            ->limit(20)
            ->get();

        return response()->json($hashtags);
    }
}