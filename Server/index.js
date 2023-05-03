// Modulos
const http = require('http');
const process = require('./Server/process.js');

// Servidor
const server = http.createServer((request, response) => {
    // Teste de conexão
    // response.writeHead(200, { 'Content-Type': 'text/plain' });
    // response.end('Hello World\n');

    // Teste de conexão com JSON
    // response.writeHead(200, { 'Content-Type': 'application/json' });
    // response.end(JSON.stringify({ message: 'Hello World' }));

    // Teste de conexão com HTML
    // response.writeHead(200, { 'Content-Type': 'text/html' });
    // response.end('<h1>Hello World</h1>');

    // let answer = '';

    switch (request.method) {
        case 'GET':
            // answer = process.doGet(request, response);
            process.doGet(request, response);
            break;
        case 'POST':
            // answer = process.doPost(request, response);
            process.doPost(request, response);
            break;
        default:
            response.writeHead(501, process.headers["plain"]);
            response.end();    
            break;
    }

    // if (answer.status === undefined) {
    //     answer.status = 200;
    // }
    // if (answer.style === undefined) {
    //     answer.style = 'plain';
    // }

    // let header = process.headers[answer.style];
    // response.writeHead(answer.status, header);
    // if (answer.style === 'plain') {
    //     response.end();
    // }

    // response.writeHead(answer.status, answer.header);
    // response.write(answer.body);
    // response.end();
});

server.listen(8020);

console.log("Server running at localhost:8020/");
