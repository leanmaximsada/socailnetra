<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['user_one_id', 'user_two_id', 'last_message_id'];

    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function getOtherUser(User $currentUser): User
    {
        return $this->user_one_id === $currentUser->id
            ? $this->userTwo
            : $this->userOne;
    }
}