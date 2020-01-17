<?php
session_start();
require __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . "/../../src/global/Request.php";
require_once __DIR__ . "/../../src/global/Router.php";

require_once __DIR__ . "/../../src/models/TemperatureModel.php";
require_once __DIR__ . "/../../src/models/UserModel.php";

$body = file_get_contents("php://input");

$request = new Request($_GET['path'] ?? "", (!empty($body)) ? json_decode($body) : new StdClass(), $_SERVER['REQUEST_METHOD']);
$router = new Router($request);

$temperatureModel = new TemperatureModel();
$userModel = new UserModel();

function sessionCheck()
{
    return boolval($_SESSION["user"]);
}

/**
 * Data management
 */

$router->get("/temperature", function (Request $request) use (&$temperatureModel) {
    if (!sessionCheck()) {
        return false;
    }

    if (sizeof($request->params) > 1) {
        $id = $request->params[1];
        return $temperatureModel->getOne($id);
    }

    return $temperatureModel->getAll();
});

$router->post("/temperature", function (Request $request) use (&$temperatureModel) {
    if (!sessionCheck()) {
        return false;
    }

    return $temperatureModel->insert($request->body);
});

$router->delete("/temperature", function (Request $request) use (&$temperatureModel) {
    if (!sessionCheck() || sizeof($request->params) < 2) {
        return false;
    }

    $id = $request->params[1];
    return $temperatureModel->delete($id);
});

/**
 * Session management
 */

$router->post("/login", function (Request $request) use (&$userModel) {
    // TODO: Make some strip of stuff
    $loginData = [
        "email" => $request->body->email,
        "password" => $request->body->password
    ];

    $result = $userModel->login($loginData);

    if ($result) {
        $_SESSION["user"] = $result;
        return $_SESSION;
    }

    return false;
});

$router->post("/register", function (Request $request) use (&$userModel) {
    $registerData = [
        "email" => $request->body->email,
        "password" => $request->body->password
    ];

    return $userModel->insert($registerData);
});

/**
 * Status route
 */
$router->get("/status", function () {
    return [
        "result" => true
    ];
});

