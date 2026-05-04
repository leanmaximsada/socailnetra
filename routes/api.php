<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\ExploreController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\HashtagController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ─── Public Routes ───────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register',         [AuthController::class, 'register']);
        Route::post('/login',            [AuthController::class, 'login']);
        Route::post('/forgot-password',  [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password',   [AuthController::class, 'resetPassword']);
        Route::get('/{provider}/redirect',  [SocialAuthController::class, 'redirect']);
        Route::get('/{provider}/callback',  [SocialAuthController::class, 'callback']);
    });

    // ─── Protected Routes ────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout',        [AuthController::class, 'logout']);
        Route::get('/auth/me',             [AuthController::class, 'me']);

        // Feed
        Route::get('/feed',                [FeedController::class, 'index']);
        Route::get('/feed/reels',          [FeedController::class, 'reels']);

        // Explore
        Route::get('/explore',             [ExploreController::class, 'index']);
        Route::get('/explore/trending',    [ExploreController::class, 'trending']);

        // Search
        Route::get('/search',              [SearchController::class, 'index']);

        // Posts
        Route::apiResource('posts', PostController::class);
        Route::post('/posts/{post}/archive',          [PostController::class, 'archive']);

        // Likes
        Route::post('/posts/{post}/like',             [LikeController::class, 'toggle']);
        Route::get('/posts/{post}/likes',             [LikeController::class, 'index']);
        Route::post('/comments/{comment}/like',       [LikeController::class, 'toggleComment']);

        // Comments
        Route::get('/posts/{post}/comments',          [CommentController::class, 'index']);
        Route::post('/posts/{post}/comments',         [CommentController::class, 'store']);
        Route::put('/comments/{comment}',             [CommentController::class, 'update']);
        Route::delete('/comments/{comment}',          [CommentController::class, 'destroy']);
        Route::get('/comments/{comment}/replies',     [CommentController::class, 'replies']);

        // Bookmarks
        Route::post('/posts/{post}/bookmark',         [BookmarkController::class, 'toggle']);
        Route::get('/bookmarks',                      [BookmarkController::class, 'index']);

        // Stories
        Route::get('/stories',                        [StoryController::class, 'index']);
        Route::post('/stories',                       [StoryController::class, 'store']);
        Route::delete('/stories/{story}',             [StoryController::class, 'destroy']);
        Route::post('/stories/{story}/view',          [StoryController::class, 'markViewed']);
        Route::get('/stories/{story}/viewers',        [StoryController::class, 'viewers']);

        // Hashtags
        Route::get('/hashtags/{name}',                [HashtagController::class, 'show']);
        Route::get('/hashtags/{name}/posts',          [HashtagController::class, 'posts']);

        // Users & Profiles
        Route::post('auth/change-password', [AuthController::class, 'changePassword']);
        Route::get('/users/suggested',                [UserController::class, 'suggested']);
        Route::get('/users/{username}',               [UserController::class, 'show']);
        Route::put('/users/profile',                  [UserController::class, 'update']);
        Route::post('/users/avatar',                  [UserController::class, 'updateAvatar']);
        Route::post('/users/cover',                   [UserController::class, 'updateCover']);
        Route::get('/users/{username}/posts',         [UserController::class, 'posts']);
        Route::get('/users/{username}/reels',         [UserController::class, 'reels']);

        // Follow
        Route::post('/users/{user}/follow',           [FollowController::class, 'toggle']);
        Route::get('/users/{username}/followers',     [FollowController::class, 'followers']);
        Route::get('/users/{username}/following',     [FollowController::class, 'following']);
        Route::get('/follow-requests',                [FollowController::class, 'requests']);
        Route::post('/follow-requests/{follow}/accept',  [FollowController::class, 'accept']);
        Route::post('/follow-requests/{follow}/decline', [FollowController::class, 'decline']);

        // Block
        Route::post('/users/{user}/block',            [UserController::class, 'block']);
        Route::post('/users/{user}/unblock',          [UserController::class, 'unblock']);

        // Conversations & Messages
        Route::get('/conversations',                          [ConversationController::class, 'index']);
        Route::post('/conversations',                         [ConversationController::class, 'store']);
        Route::get('/conversations/{conversation}',           [ConversationController::class, 'show']);
        Route::get('/conversations/{conversation}/messages',  [MessageController::class, 'index']);
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
        Route::delete('/messages/{message}',                  [MessageController::class, 'destroy']);
        Route::post('/conversations/{conversation}/read',     [MessageController::class, 'markRead']);

        // Notifications
        Route::get('/notifications',                  [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count',     [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{id}/read',       [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all',        [NotificationController::class, 'markAllRead']);
        Route::delete('/notifications/{id}',          [NotificationController::class, 'destroy']);
    });
});