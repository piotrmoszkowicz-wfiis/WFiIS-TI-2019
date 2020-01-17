<?php
require_once __DIR__ . "/../global/MongoConnector.php";

class TemperatureModel
{
    private MongoDB\Collection $collection;
    private MongoConnector $mongoConnector;

    function __construct()
    {
        $this->mongoConnector = new MongoConnector();
        $this->collection = $this->mongoConnector->connection->temperature;
    }

    function getAll()
    {
        return array_map(function ($temperature) {
            $temperature["_id"] = (string)$temperature["_id"];
            return $temperature;
        }, $this->collection->find()->toArray());
    }

    function getOne($id)
    {
        return $this->collection->find([
            "_id" => new MongoDB\BSON\ObjectID($id)
        ])->toArray()[0];
    }

    function insert($temperatureData)
    {
        $insertResult = $this->collection->insertOne($temperatureData);
        if ($insertResult->getInsertedCount() === 1) {
            $result = $this->getOne($insertResult->getInsertedId());
            $result["_id"] = (string)$result["_id"];
            return $result;
        }
        return false;
    }

    function delete($id)
    {
        if ($this->collection->deleteOne([
                "_id" => new MongoDB\BSON\ObjectID($id)
            ])->getDeletedCount() === 1) {
            return array("deleted" => true);
        }
        return false;
    }
}
