<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AppMenuExtraController;

// 🔓 ROTA PÚBLICA (SEM TOKEN)
Route::post('users/login', [UsuarioController::class, 'login']);

// 🔒 ROTAS PROTEGIDAS
Route::middleware('jwt')->group(function () {

    // Usuário logado
    Route::get('/me', [UsuarioController::class, 'me']);

    // CRUD de usuários
    Route::get('/users', [UsuarioController::class, 'index']);
    Route::get('/users/{id}', [UsuarioController::class, 'show']);

    // CRUD de appmenuextra
    Route::get('/appmenuextra', [AppMenuExtraController::class, 'index']);
    Route::get('/appmenuextra/{id}', [AppMenuExtraController::class, 'show']);
    Route::post('/appmenuextra', [AppMenuExtraController::class, 'store']);
    Route::put('/appmenuextra/{id}', [AppMenuExtraController::class, 'update']);
    Route::delete('/appmenuextra/{id}', [AppMenuExtraController::class, 'destroy']);

});