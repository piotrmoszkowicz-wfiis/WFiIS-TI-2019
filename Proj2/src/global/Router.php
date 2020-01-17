<?php


class Router
{
    private Request $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    function __call($name, $args)
    {
        list($route, $method) = $args;
        $this->{strtolower($name)}[$this->formatRoute($route)] = $method;
    }

    private function formatRoute($route)
    {
        $result = rtrim($route, "/");
        if ($result === "") {
            return "/";
        }
        return $result;
    }

    private function error400()
    {
        header("HTTP/1.1 400 Bad Request");
    }

    private function error404()
    {
        header("HTTP/1.1 404 Not Found");
    }

    function resolve()
    {
        $methodDictionary = $this->{strtolower($this->request->method)};
        $formatedRoute = $this->formatRoute($this->request->endpoint);
        $method = $methodDictionary[$formatedRoute];

        if (is_null($method)) {
            $this->error404();
            return;
        }

        $result = call_user_func_array($method, array($this->request));

        if (!$result) {
            $this->error400();
            return;
        }

        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode($result);
    }

    function __destruct()
    {
        $this->resolve();
    }
}
