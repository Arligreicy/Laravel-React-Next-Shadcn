<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Gusuario extends Authenticatable implements JWTSubject
{
    
    protected $table = 'GUSUARIOS';
    protected $primaryKey = 'IDUSUARIO';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    //👉 Isso mostra que ele não usa created_at nem updated_at,e o campo IDUSUARIO é a chave primária.

    protected $fillable = [ //🔒 Campos fillable: Esses são os campos que o Laravel permite preencher em massa (por exemplo com $model->fill($request->all())).
        'ATIVO',
        'NOME',
        'EMAIL',
        'LOGIN',
        'SENHA',
        'SENHAHASH',
        'IDPERFIL',
        'IDDEPART',
        'USUARIOCAD',
        'DATACAD',
        'USUARIOALT',
        'DATAALT',
        'DTULTIMOACESSO',
        'ADMSOLICITACAO',
        'TELEFONE',
        'DASHPERMISSOES',
        'DASHADM',
        'ADMSOLDEPART',
        'SENHAEMAIL',
        'AGENDAIGNORADIAS',
        'GOOGLESECRET',
        'GOOGLESECRETATIVO',
        'DEPARTAMENTOS',
        'IMAGEM',
        'EMAILOFFICE',
        'SENHAOFFICE',
        'LOGINAD',
        'DTINCLUSAOAD',
        'SENHAULTIMAALT'
    ];

    protected $hidden = [ //🔐 Campos hidden: Esses são omitidos das respostas JSON — e tá certinho esconder as senhas e dados sensíveis.
        'SENHA',
        'SENHAHASH',
        'SENHAEMAIL',
        'GOOGLESECRET'
    ];

    public function username() //→ retorna o nome do usuário.
    {
        return $this->LOGIN;
    }

     // ------------🔑 Implementa JWTSubject: ----------------

    // Identificador do token (normalmente a PK)
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Claims personalizadas no token (opcional)
    public function getJWTCustomClaims()
    {
        return [];
    }

    // --------------- Autenticação -------------------
    // Retorna a coluna de senha para o Laravel
    public function getAuthPassword()
    {
        return $this->SENHAHASH;
    }
    /**
     * Normaliza todas as chaves recebidas para MAIÚSCULO.
     */
    public function fill(array $attributes)
    {
        $normalized = [];

        foreach ($attributes as $key => $value) {
            $normalized[strtoupper($key)] = $value;
        }

        return parent::fill($normalized);
    }

}