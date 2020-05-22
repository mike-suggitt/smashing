const connections = {};
const history = {};

class EventService {
    constructor() {

    }

    addConnection(req, res) {
        const conn = {
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
    }

    trigger(body) {
        const id = body.id || (Math.floor(Math.random()*1001));
        body.updatedAt = Date.now();
        const event = format_event(body);
        for (const k in connections) {
            connections[k].send(event);
        }
    }
}

function latest_events() {
    const str = [];
    for (var id in history) {
        str.push(history[id]);
    }
    return str.join('');
}

function format_event(body) {
    return 'data: ' + JSON.stringify(body) + '\n\n';
}

global.__es = global.__es || new EventService();
module.exports = global.__es;