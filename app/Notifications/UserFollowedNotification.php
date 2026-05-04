<?php
namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class UserFollowedNotification extends Notification
{
    use Queueable;

    public function __construct(public User $follower) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'      => 'follow',
            'sender_id' => $this->follower->id,
            'sender'    => [
                'id'       => $this->follower->id,
                'name'     => $this->follower->name,
                'username' => $this->follower->username,
                'avatar'   => $this->follower->avatar,
            ],
        ];
    }
}