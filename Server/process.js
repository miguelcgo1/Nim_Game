var url = require("url");
var fs = require("fs");
var crypto = require('crypto');
var process = require('./process.js');

var headers = {
    "plain": {
        "Content-Type": "application/javascript",
        "cache-control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    },
    sse: {
        "Content-Type": "text/event-stream",
        "cache-control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Connection": "keep-alive"
    }
}

module.exports.doGet = function (request, response) {
    var parsedUrl = url.parse(request.url, true);
    var pathname = parsedUrl.pathname;
    var query = parsedUrl.query;

    let answer = {};

    var body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
        switch (pathname) {
            case '/update':
                if (query["game"] == null) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ "error": "Game is undefined" });

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                }
                else if (query["nick"] == null) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ "error": "Nick is undefined" });

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                }
                
                // Uso do updater ???
    
                // updater.remember(response);
                // request.on('close', () => {
                //     updater.forget(response);
                // });
                // setImmediate(() => {
                //     updater.update(counter.get());
                // });
                // answer.style = 'sse';
                // response.end();
                // return answer;
                break;
            default:
                answer.status = 404;
                answer.header = headers["plain"];
                answer.body = JSON.stringify({ "error": "Page not found" });
                // return answer;

                response.writeHead(answer.status, answer.header);
                response.write(answer.body);
                response.end();
                break;
        }
    });
    request.on('close', () => { response.end(); });
    request.on('error', (error) => {
        console.log(error.message);
        response.writeHead(404, headers["plain"]);
        response.end();
        return;
    });
}

module.exports.doPost = function (request, response) {
    var parsedUrl = url.parse(request.url, true);
    var pathname = parsedUrl.pathname;
    // var query = parsedUrl.query;

    let answer = {};
    var body = '';

    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
        try {
            var query = JSON.parse(body);
        } catch (error) {
            console.log(error.message);
            answer.status = 400;
            answer.header = headers["plain"];
            answer.body = JSON.stringify({ "error": "Error parsing JSON request: " + error});

            response.writeHead(answer.status, answer.header);
            response.write(answer.body);
            response.end();
            return;
        }

        switch (pathname) {
            case '/register':
                if (query["nick"] == null) {
                    // console.log(query["nick"]);
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ error: "Nick is undefined" });
                    // response.end();
                    // return answer;
                    
                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                }
                else if (query["password"] == null) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ error: "Password is undefined" });
                    // response.end();
                    // return answer;

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                }   

                var regUser = registerUser(query["nick"], query["password"]);
                
                if (regUser == 1) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ error: "User registered with a different password" });

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                }
                else if (regUser == 0) {
                    answer.status = 200;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({});

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                } else {
                    answer.status = 500;
                    answer.header = headers["plain"];
                    // answer.body = JSON.stringify({ "error": "Internal error" });

                    response.writeHead(answer.status, answer.header);
                    response.end();
                }
                // return answer;
                break;
            case '/ranking':
                if (query["size"] == null) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ error: "Size is undefined" });
                    // response.end();
                    // return answer;

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                } else if (!Number.isInteger(parseInt(query["size"]))) {
                    answer.status = 400;
                    answer.header = headers["plain"];
                    answer.body = JSON.stringify({ error: "Invalid size" });
                    // response.end();
                    // return answer;

                    response.writeHead(answer.status, answer.header);
                    response.write(answer.body);
                    response.end();
                    break;
                }

                var ranking = rankingJSON(query["size"]);

                answer.status = 200;
                answer.header = headers["plain"];
                answer.body = JSON.stringify(ranking);
                // response.end();
                // return answer;

                response.writeHead(answer.status, answer.header);
                response.write(answer.body);
                response.end();
                break;
            default:
                answer.status = 404;
                answer.header = headers["plain"];
                answer.body = JSON.stringify({ "error": "Page not found" }); 
                // response.end();
                // return answer;

                response.writeHead(answer.status, answer.header);
                response.write(answer.body);
                response.end();
                break;
        }
    });
    request.on('error', (error) => {
            console.log(error.message);
            response.writeHead(400, headers["plain"]);
            response.end();
            return;
        });
}
     
function registerUser(nick, password) {
    var fileData = fs.readFileSync("./Server/users.json");
    fileData = JSON.parse(fileData.toString())["users"];

    password = crypto.createHash('md5').update(password).digest('hex');

    for (var i = 0; i < fileData.length; i++) {
        if (fileData[i]["nick"] == nick) {
            if (fileData[i]["password"] != password)
                return 1;
            else
                return 0;
        }
    }

    var newUser = {nick: nick, password: password, games: {}};
    fileData.push(newUser);

    var json = JSON.stringify({users: fileData});
    fs.writeFileSync("./Server/users.json", json);

    return 0;
}

function rankingJSON(size) {
    var fileData = fs.readFileSync("./Server/users.json");
    fileData = JSON.parse(fileData.toString())["users"];

    var ranking = [];
    for (var i = 0; i < fileData.length; i++) {
        if (fileData[i]["games"][size] != null) {
            let data = {
                "nick": fileData[i]["nick"],
                "victories": fileData[i]["games"][size]["victories"],
                "games": fileData[i]["games"][size]["games"]
            }
            ranking.push(data);
        }
    }

    // ranking.sort(function(a, b) {
    //     if (a["victories"] > b["victories"]) {
    //         return -1;
    //     } else if (a["victories"] < b["victories"]) {
    //         return 1;
    //     } 
    //     return 0;
    // });

    for (var i = 0; i < ranking.length; i++) {
        for (var j = i + 1; j < ranking.length; j++) {
            if (ranking[j]["victories"] > ranking[i]["victories"]) {
                var aux = ranking[i];
                ranking[i] = ranking[j];
                ranking[j] = aux;
            }
        }
    }

    ranking = ranking.slice(0, 10);
    ranking = {ranking: ranking};

    return ranking;
}

