<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAdminAccess
{
    /**
     * التحقق من أن المستخدم له صلاحيات إدارية (admin أو moderator)
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'moderator'])) {
            return response()->json([
                'message' => 'غير مصرح لك بالوصول لهذه الصفحة',
            ], 403);
        }

        return $next($request);
    }
}
