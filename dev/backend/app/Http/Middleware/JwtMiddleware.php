<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->cookie('token');

            if (!$token) {
                return response()->json(['erro' => 'Token não encontrado'], 401);
            }

            $usuario = JWTAuth::setToken($token)->authenticate();

            if (!$usuario) {
                return response()->json(['erro' => 'Usuário não encontrado'], 401);
            }

            $request->merge(['usuario_id' => $usuario->IDUSUARIO]);

        } catch (\Exception $e) {
            return response()->json(['erro' => 'Token inválido', 'detalhe' => $e->getMessage()], 401);
        }

        return $next($request);
    }
}