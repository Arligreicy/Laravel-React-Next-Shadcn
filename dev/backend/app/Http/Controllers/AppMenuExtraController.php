<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppMenuExtra;

class AppMenuExtraController extends Controller
{
    public function index() // → lista todos os menus extras.
    {
        $menusExtras = AppMenuExtra::all();
        return response()->json($menusExtras);

    } // LISTAR TODOS

    public function show($id) //→ mostra um menu extra específico.
    {
        $menuExtra = AppMenuExtra::find($id);

        if (!$menuExtra) {
            return response()->json(['message' => 'Menu Extra não encontrado'], 404);
        }

        return response()->json($menuExtra);

    } // MOSTRAR UM MENU EXTRA

    public function store(Request $request) // → cria um novo menu extra.
    {
        $request->validate([

            'TITULO' => 'required|string',
            'ICONE' => 'nullable|string',
            'URL' => 'required|string',
            'TIPOUSUARIO' => 'nullable|string',
            'NIVELENSINO' => 'nullable|string',
            'CONTEXTOUSUARIO' => 'nullable|string',
            'COR' => 'nullable|string',
            'VISIVEL' => 'required|in:S,N',
            'TARGET' => 'nullable|string',
            'USUARIOCAD' => 'required|string',
            'DATACAD' => 'nullable|date',
            'USUARIOALT' => 'nullable|string',
            'DATAALT' => 'nullable|date',
        ]);

        $menuExtra = AppMenuExtra::create($request->all());

        return response()->json($menuExtra, 201);

    } // CRIAR UM MENU EXTRA

    public function update(Request $request, $id) // → atualiza um menu extra existente.
    {
        $menuExtra = AppMenuExtra::find($id);

        if (!$menuExtra) {
            return response()->json(['message' => 'Menu Extra não encontrado'], 404);
        }

        $request->validate([
            'TITULO' => 'sometimes|string',
            'ICONE' => 'sometimes|nullable|string',
            'URL' => 'sometimes|string',
            'TIPOUSUARIO' => 'sometimes|nullable|string',
            'NIVELENSINO' => 'sometimes|nullable|string',
            'CONTEXTOUSUARIO' => 'sometimes|nullable|string',
            'COR' => 'sometimes|nullable|string',
            'VISIVEL' => 'sometimes|in:S,N',
            'TARGET' => 'sometimes|nullable|string',
            'USUARIOALT' => 'sometimes|string',
        ]);
        $menuExtra->update([
            ...$request->all(),
            'DATAALT' => now(),
        ]);

        return response()->json($menuExtra);

    } // ATUALIZAR UM MENU EXTRA

    public function destroy($id) // → exclui um menu extra.
    {
        $menuExtra = AppMenuExtra::find($id);

        if (!$menuExtra) {
            return response()->json(['message' => 'Menu Extra não encontrado'], 404);
        }

        $menuExtra->delete();

        return response()->json(['message' => 'Menu Extra excluído com sucesso']);

    } // EXCLUIR UM MENU EXTRA
}
