<?php


class MongoConnector
{
    private string $host = "mongodb";
    private string $user = "";
    private string $password = "";
    private string $db = "ti-proj";

    public MongoDB\Database $connection;

    function __construct()
    {
        $conn = new MongoDB\Client("mongodb://{$this->host}:27017");
        // $conn = new MongoDB\Client("mongodb://{$this->user}:{$this->password}@{$this->host}");
        $this->connection = $conn->{$this->db};
    }
}
