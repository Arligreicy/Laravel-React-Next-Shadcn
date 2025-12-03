<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppMenuExtra extends Model
{
    protected $table = 'APPMENUEXTRA'; // Nome da tabela no banco de dados
    protected $primaryKey = 'IDMENU'; // Chave primária da tabela
    public $incrementing = true; // Se a chave primária é auto-incrementável
    protected $keyType = 'int'; // Tipo da chave primária
    public $timestamps = false; // Desabilitar timestamps se não houver colunas created_at e updated_at

    protected $fillable = [
        'TITULO',
        'ICONE',
        'URL',
        'TIPOUSUARIO',
        'NIVELENSINO',
        'CONTEXTOUSUARIO',
        'COR',
        'VISIVEL',
        'TARGET',
        'USUARIOCAD',
        'DATACAD',
        'USUARIOALT',
        'DATAALT'
    ];

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
