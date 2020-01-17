<?php
require_once __DIR__ . "/../global/MongoConnector.php";

class UserModel
{
    private MongoDB\Collection $collection;
    private MongoConnector $mongoConnector;

    function __construct()
    {
        $this->mongoConnector = new MongoConnector();
        $this->collection = $this->mongoConnector->connection->users;
    }

    function getOne($email)
    {
        return $this->collection->find([
            "email" => $email
        ])->toArray();
    }

    function login($loginData)
    {
        $user = $this->getOne($loginData['email'])[0];

        if ($user === NULL) {
            return false;
        }

        if (password_verify($loginData['password'], $user['password'])) {
            return $user;
        }

        return false;
    }

    function insert($user)
    {
        // TODO: Check if that one works in terms of duplicates
        if ($this->getOne($user["email"])[0] !== NULL) {
            return false;
        }

        $user['password'] = password_hash($user['password'], PASSWORD_BCRYPT);

        if ($this->collection->insertOne($user)->getInsertedCount() === 1) {
            return $user;
        }

        return false;
    }
}
