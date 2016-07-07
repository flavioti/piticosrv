'use strict';

var cluster = require('cluster');

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    };

    cluster.on('online', function (worker) { console.log('Worker ' + worker.process.pid + ' is online') });
    cluster.on('exit', function (worker, code, signal) { cluster.fork() });

} else {

    var fs = require('fs'),
        express = require("express"),
        bodyParser = require('body-parser');

    var app = express();

    app.use(bodyParser.json());

    require('./api/routes')(app);

    var ServerInfo = require('./config.json')['General']['ServerInfo'];
    var ip = process.env.OPENSHIFT_NODEJS_IP || ServerInfo.ip || require('./api/servicos/AmbienteUtil').obterIpLocal();

    var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || ServerInfo.port || 8080;

    console.log('Process ' + process.pid + ' running on ' + ip + ':' + port)

    app.listen(port, ip, function () {
        console.log('Process ' + process.pid + ' running on ' + ip + ':' + port)
    })

}