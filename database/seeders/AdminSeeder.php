<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء حساب Admin (الشيخ حاتم)
        User::updateOrCreate(
            ['email' => 'admin@ejtahd.com'],
            [
                'name' => 'الشيخ حاتم',
                'email' => 'admin@ejtahd.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // إنشاء حساب Moderator تجريبي
        User::updateOrCreate(
            ['email' => 'moderator@ejtahd.com'],
            [
                'name' => 'متابع تجريبي',
                'email' => 'moderator@ejtahd.com',
                'password' => Hash::make('moderator123'),
                'role' => 'moderator',
            ]
        );

        $this->command->info('✅ تم إنشاء حسابات Admin و Moderator بنجاح!');
        $this->command->info('   Admin: admin@ejtahd.com / admin123');
        $this->command->info('   Moderator: moderator@ejtahd.com / moderator123');
    }
}
