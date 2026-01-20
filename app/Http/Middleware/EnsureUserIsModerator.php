<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsModerator
{
    /**
     * التحقق من أن المستخدم هو متابع
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'moderator') {
            return response()->json([
                'message' => 'غير مصرح لك بالوصول لهذه الصفحة',
            ], 403);
        }

        return $next($request);
    }
}
