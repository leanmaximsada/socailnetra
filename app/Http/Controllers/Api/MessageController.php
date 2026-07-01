use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

// Add this private method:
private function getCloudinary(): Cloudinary
{
    return new Cloudinary(
        Configuration::instance([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => ['secure' => true],
        ])
    );
}

// Replace the upload section in store():
if ($request->hasFile('media')) {
    $file         = $request->file('media')
    $cloudinary   = $this->getCloudinary();
    $result       = $cloudinary->uploadApi()->upload(
        $file->getRealPath(),
        [
            'folder'        => 'socialnetra/messages/' . $conversation->id,
            'resource_type' => $messageType === 'voice' ? 'video' : 'auto',
        ]
    );
    $mediaUrl = $result['secure_url'];
}