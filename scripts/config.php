<?php

declare(strict_types=1);

/*
 * Update these values for your MySQL environment.
 */
const DB_HOST = 'localhost';
const DB_NAME = 'sistersbridal';
const DB_PORT = 3306;
const DB_USER = 'root';
const DB_PASS = '';

function getDatabaseConnection(): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_PORT,
        DB_NAME
    );

    return new PDO(
        $dsn,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
}
