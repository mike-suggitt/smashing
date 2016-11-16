var connections = {};
var history = {};

var EventService = function() {};
EventService.prototype.addConnection = function(req, res) {
    var conn = {
        id: (new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString()),
        send: function (body) {
            res.write(body);
        }
    };
    connections[conn.id] = conn;

    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable buffering for nginx
    });
    res.write('\n');
    req.on('close', function () {
        delete connections[conn.id];
    });
};

EventService.prototype.trigger = function(body) {
    var id = body.id || (Math.floor(Math.random()*1001));
    body.updatedAt = Date.now();
    var event = format_event(body);
    for (var k in connections) {
        connections[k].send(event);
    }
};


function latest_events() {
    var str = [];
    for (var id in history) {
        str.push(history[id]);
    }
    return str.join('');
}

function format_event(body) {
    return 'data: ' + JSON.stringify(body) + '\n\n';
}

module.exports = new EventService();