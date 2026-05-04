<?php
namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification
{
    use Queueable;

    public function __construct(public User $liker, public Post $post) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

public function toDatabase(object $notifiable): array
{
    $data = [
        'type'      => 'like',
        'post_id'   => $this->post->id,
        'sender_id' => $this->liker->id,
        'sender'    => [
            'id'       => $this->liker->id,
            'name'     => $this->liker->name,
            'username' => $this->liker->username,
            'avatar'   => $this->liker->avatar,
        ],
        'post' => [
            'id'      => $this->post->id,
            'caption' => $this->post->caption,
        ],
    ];

    // Broadcast real-time
    broadcast(new \App\Events\NewNotificationEvent($notifiable->id, $data));

    return $data;
}

    
}