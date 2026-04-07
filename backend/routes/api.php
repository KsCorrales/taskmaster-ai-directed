<?php

use App\Http\Controllers\Todo\TodoController;
use Illuminate\Support\Facades\Route;

Route::get('/todos', [TodoController::class, 'index']);
Route::post('/todos', [TodoController::class, 'store']);
Route::put('/todos/{todo}', [TodoController::class, 'update']);
Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);
