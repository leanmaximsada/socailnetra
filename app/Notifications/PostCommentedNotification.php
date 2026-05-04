<?php
namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PostCommentedNotification extends Notification
{
    use Queueable;

    public function __construct(public User $commenter, public Post $post, public Comment $comment) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'      => 'comment',
            'post_id'   => $this->post->id,
            'sender_id' => $this->commenter->id,
            'sender'    => [
                'id'       => $this->commenter->id,
                'name'     => $this->commenter->name,
                'username' => $this->commenter->username,
                'avatar'   => $this->commenter->avatar,
            ],
            'post' => [
                'id'      => $this->post->id,
                'caption' => $this->post->caption,
            ],
            'comment' => [
                'id'   => $this->comment->id,
                'body' => $this->comment->body,
            ],
        ];
    }
}