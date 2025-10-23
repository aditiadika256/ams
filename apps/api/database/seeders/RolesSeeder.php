<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesSeeder extends Seeder
{
    public function run()
    {
        // default roles
        $roles = ['superadmin','admin','trainer','siswa','finance'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // example permissions (expand later)
        $permissions = ['manage users','manage content','manage exams','view reports'];
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // attach some permissions to admin
        $admin = Role::where('name','admin')->first();
        if ($admin) {
            $admin->givePermissionTo(['manage users','manage content']);
        }

        // create demo superadmin
        $user = User::firstOrCreate([
            'email' => 'superadmin@example.com'
        ],[
            'name' => 'Super Admin',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole('superadmin');
    }
}
