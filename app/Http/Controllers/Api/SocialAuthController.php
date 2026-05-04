<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider): JsonResponse
    {
        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function callback(string $provider): JsonResponse
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        $user = User::where('provider', $provider)
                    ->where('provider_id', $socialUser->getId())
                    ->orWhere('email', $socialUser->getEmail())
                    ->first();

        if (!$user) {
            $username = strtolower(Str::slug($socialUser->getName(), '_'));
            // Make username unique
            $base = $username;
            $i = 1;
            while (User::where('username', $username)->exists()) {
                $username = $base . '_' . $i++;
            }

            $user = User::create([
                'name'        => $socialUser->getName(),
                'username'    => $username,
                'email'       => $socialUser->getEmail(),
                'avatar'      => $socialUser->getAvatar(),
                'provider'    => $provider,
                'provider_id' => $socialUser->getId(),
                'password'    => null,
            ]);
        } else {
            $user->update([
                'provider'    => $provider,
                'provider_id' => $socialUser->getId(),
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }
}