<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Gusuario;

class UsuarioController extends Controller
{
    
    public function index() 
    {
        $usuarios = Gusuario::all();
        return response()->json($usuarios);

    }// LISTAR TODOS

    public function show($id) //→ mostra um usuário específico.
    {
        $usuario = Gusuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }

        return response()->json($usuario);

    }// MOSTRAR UM USUÁRIO

    public function login(Request $request) //→ autentica e retorna token JWT.
    {

        $request->validate([
            'login' => 'required|string',
            'senha' => 'required|string'
        ]);

         // Buscar pelo campo LOGIN (case sensitive)
        $usuario = Gusuario::where('LOGIN', $request->login)->first();

        //Se usuário nao encontrado
        if (!$usuario) {
            return response()->json(['message' => 'Usuário ou senha incorretos'], 404);
        }

        // Verifica senha usando SENHAHASH
        if (!Hash::check($request->senha, $usuario->SENHAHASH)) {
            return response()->json(['message' => 'Usuário ou senha incorretos'], 401);
        }

        //Gerar o token JWT pro usuário autenticado
        $token = JWTAuth::fromUser($usuario);
        
        // Criar cookie HTTP-only (token não aparece no front)
        $cookie = cookie(
            'token',        // nome do cookie
            $token,         // valor (JWT)
            60 * 24,        // expira em 1 dia
            '/',            // path
            null,           // domínio
            false,          // secure -> coloque true em produção https
            true,           // httpOnly
            false,          // raw
            'Lax'          // SameSite
        );

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'usuario' => $usuario,
            //'token' => $token // só pra testes
        ])->withCookie($cookie);

    }

    public function me(Request $request)
    {
        try {
              $token = $request->bearerToken() ?? $request->cookie('token');
            
            if (!$token) {
                return response()->json(['message' => 'Token não encontrado'], 401);
            }

            $usuario = JWTAuth::setToken($token)->authenticate();

           return response()->json($usuario);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['message' => 'Token expirado'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        } catch (\Exception $e) {
           return response()->json([
                'message' => 'Erro ao autenticar',
                'erro' => $e->getMessage() // para debug
            ], 500);
        }
    }

    // public function logout(Request $request) //→ invalida o token JWT.
    // {
    //     try {
    //         JWTAuth::parseToken()->invalidate();
    //         return response()->json(['message' => 'Logout realizado com sucesso']);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Erro ao fazer logout'], 500);
    //     }
    // }

    public function store(Request $request)
    {
        $validated = $request->validate([ //→ valida os campos obrigatórios.
            'NOME' => 'required|string|max:255',
            'EMAIL' => 'required|string|email|max:255|unique:GUSUARIOS,EMAIL', //→ garante que o e-mail não se repita na tabela GUSUARIO.
            'LOGIN' => 'required|string|max:50|unique:GUSUARIOS,LOGIN',
            'SENHA' => 'required|string|min:6',
            'IDPERFIL' => 'required|integer',
            'IDDEPART' => 'required|integer',
            // Adicione outras validações conforme necessário
        ]);

        // salva senha pura no legado (mantém compatibilidade)
        $validated['SENHA'] = $validated['SENHA'];

        // CRIPTOGRAFA a senha nova
        $validated['SENHAHASH'] = Hash::make($validated['SENHA']);

        // CAMPOS PADRÃO
        $validated['ATIVO'] = 'S';
        $validated['USUARIOCAD'] = auth()->id() ?? null;
        $validated['DATACAD'] = now();

        $usuario = Gusuario::create($validated); //→ cria o registro (precisa que o model tenha o protected $fillable configurado).
        return response()->json($usuario, 201); //→ responde em formato JSON e com status 201 (Created).

    }// CRIAR UM NOVO USUÁRIO

    public function update(Request $request, $id)
    {
        $usuario = Gusuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }

       
        $data = [];
        foreach ($request->all() as $key => $value) {
            $data[strtoupper($key)] = $value;
        }
       
        $validated = validator($data, [
            'ATIVO' => 'sometimes|string|in:S,N',
            'NOME' => 'sometimes|required|string|max:255',
            'EMAIL' => 'sometimes|required|string|email|max:255|unique:GUSUARIOS,EMAIL,' . $id . ',IDUSUARIO',
            'LOGIN' => 'sometimes|required|string|max:50|unique:GUSUARIOS,LOGIN,' . $id . ',IDUSUARIO',
            'SENHA' => 'sometimes|nullable|string|min:6',
            'IDPERFIL' => 'sometimes|nullable|integer',
            'IDDEPART' => 'sometimes|nullable|integer',
        ])->validate();

        if (!empty($validated['SENHA'])) {
            $validated['SENHAHASH'] = Hash::make($validated['SENHA']);
        }

        $validated['USUARIOALT'] = auth()->id() ?? null;
        $validated['DATAALT'] = now();

        $usuario->fill($validated)->save();

        return response()->json($usuario);
    }

    public function destroy($id)
    {
        $usuario = Gusuario::find($id);
        if (!$usuario) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }

        $usuario->delete();
        return response()->json(['message' => 'Usuário deletado com sucesso']);

    }// DELETAR UM USUÁRIO
    
}