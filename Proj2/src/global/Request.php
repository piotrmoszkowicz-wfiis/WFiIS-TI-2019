<?php


class Request
{
    public StdClass $body;
    public string $endpoint;
    public array $params;
    public string $path;
    public string $method;

    function __construct($path, $body, $method)
    {
        $this->path = $path;
        $this->body = $body;
        $this->endpoint = "/" . explode("/", $this->path)[0];
        $this->params = explode("/", $this->path);
        $this->method = $method;
    }

}
