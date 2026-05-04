<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $convos = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with([
                'userOne:id,name,username,avatar',
                'userTwo:id,name,username,avatar',
                'lastMessage',
            ])
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json($convos);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'exists:users,id']]);

        $authId   = $request->user()->id;
        $targetId = (int) $request->user_id;
        $minId    = min($authId, $targetId);
        $maxId    = max($authId, $targetId);

        $convo = Conversation::firstOrCreate([
            'user_one_id' => $minId,
            'user_two_id' => $maxId,
        ]);

        $convo->load([
            'userOne:id,name,username,avatar',
            'userTwo:id,name,username,avatar',
        ]);

        return response()->json($convo, 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->load([
            'userOne:id,name,username,avatar',
            'userTwo:id,name,username,avatar',
        ]);

        return response()->json($conversation);
    }
}