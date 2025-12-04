<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AppMenuExtraController;

// 🔓 LOGIN
Route::post('users/login', [UsuarioController::class, 'login']);

// 🔒 ROTAS PROTEGIDAS
Route::middleware('jwt')->group(function () {

    Route::get('me', [UsuarioController::class, 'me']);

    Route::get('users', [UsuarioController::class, 'index']);
    Route::get('users/{id}', [UsuarioController::class, 'show']);
    Route::post('users', [UsuarioController::class, 'store']);
    Route::put('users/{id}', [UsuarioController::class, 'update']);
    Route::delete('users/{id}', [UsuarioController::class, 'destroy']);

    Route::get('appmenuextra', [AppMenuExtraController::class, 'index']);
    Route::get('appmenuextra/{id}', [AppMenuExtraController::class, 'show']);
    Route::post('appmenuextra', [AppMenuExtraController::class, 'store']);
    Route::put('appmenuextra/{id}', [AppMenuExtraController::class, 'update']);
    Route::delete('appmenuextra/{id}', [AppMenuExtraController::class, 'destroy']);
});
