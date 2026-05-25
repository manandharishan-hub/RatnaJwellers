<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $table = 'otps';
    protected $fillable = ['email', 'otp_code', 'expires_at'];
    public $timestamps = true;

    public function isValid()
    {
        return now()->lessThanOrEqualTo($this->expires_at);
    }

    public static function generate($email)
    {
        // Delete any existing OTPs for this email
        static::where('email', $email)->delete();

        $otp_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires_at = now()->addMinutes(config('auth.otp_validity_minutes', 10));

        return static::create([
            'email' => $email,
            'otp_code' => $otp_code,
            'expires_at' => $expires_at,
        ]);
    }

    public static function verify($email, $otp_code)
    {
        $otp = static::where('email', $email)
            ->where('otp_code', $otp_code)
            ->latest()
            ->first();

        if (!$otp || !$otp->isValid()) {
            return null;
        }

        return $otp;
    }
}
