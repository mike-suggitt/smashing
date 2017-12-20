var mincer = require("mincer");
var path = require("path");
var logger = require("morgan");

module.exports = function (smashing) {

    // register default pre-processors
    mincer.registerMimeType('text/html', '.html');
    mincer.registerPreProcessor('text/html', mincer.DirectiveProcessor);
    mincer.registerPreProcessor('text/html', mincer.MacroProcessor);

    mincer.logger.use(logger);

    smashing.mincer = {};
    smashing.mincer.environment = new mincer.Environment();
    smashing.mincer.assets_prefix = '/assets';
    smashing.mincer.environment.appendPath(path.resolve(__dirname, 'public'));

    smashing.mincer.start = function () {
        smashing.mincer.server = mincer.createServer(smashing.mincer.environment);
    };
};