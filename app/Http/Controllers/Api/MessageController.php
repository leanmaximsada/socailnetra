<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\NewMessageEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,name,username,avatar')
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($messages);
    }

    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $userId,
            'body'            => $request->body,
            'type'            => 'text',
        ]);

        $conversation->update([
            'last_message_id' => $message->id,
            'updated_at'      => now(),
        ]);

        $message->load('sender:id,name,username,avatar');
        broadcast(new NewMessageEvent($message))->toOthers();

        return response()->json($message, 201);
    }

    public function destroy(Request $request, Message $message): JsonResponse
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }

    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}