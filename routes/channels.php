<?php
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    Log::info('Channel auth attempt', [
        'user_id' => $user->id,
        'userId' => $userId,
        'match' => (int) $user->id === (int) $userId
    ]);
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);
    if (!$conversation) return false;
    return $user->id === $conversation->user_one_id ||
           $user->id === $conversation->user_two_id;
});