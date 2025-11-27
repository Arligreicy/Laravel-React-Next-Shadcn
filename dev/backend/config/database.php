<?php

use Illuminate\Support\Str;

return [

    'default' => env('DB_CONNECTION', ''),

    'connections' => [

        'sif' => [
            'driver' => 'sqlsrv',
            'host' => env('DB_HOST', ''),
            'port' => env('DB_PORT', ''),
            'database' => env('DB_DATABASE', ''),
            'username' => env('DB_USERNAME', ''),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
        ],

        'controlid' => [
            'driver' => 'sqlsrv',
            'host' => env('DB_CONTROLID_HOST', ''),
            'port' => env('DB_CONTROLID_PORT', ''),
            'database' => env('DB_CONTROLID_DATABASE', ''),
            'username' => env('DB_CONTROLID_USERNAME', ''),
            'password' => env('DB_CONTROLID_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
        ],

        'site' => [
            'driver' => 'mysql',
            'host' => env('DB_SITE_HOST', ''),
            'port' => env('DB_SITE_PORT', ''),
            'database' => env('DB_SITE_DATABASE', ''),
            'username' => env('DB_SITE_USERNAME', ''),
            'password' => env('DB_SITE_PASSWORD', ''),
            'charset' => 'utf8',
            'collation' => 'utf8_general_ci',
            'prefix' => '',
        ],

        // Se quiser adicionar RM ou RM_TST, basta criar novas conexões SQL Server:
        'rm' => [
            'driver' => 'sqlsrv',
            'host' => '192.168.1.223',
            'port' => '1433',
            'database' => 'CORPORERM',
            'username' => 'sifadmin',
            'password' => 'dev@FjauDB!;25',
            'charset' => 'utf8',
            'prefix' => '',
        ]

    
    ],

];

