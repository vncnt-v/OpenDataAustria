module.exports = {
    getData: function (writer) {
        var http = require('https');
        var options = {
            host: 'info.gesundheitsministerium.gv.at',
            path: '/data/laender.csv'
        }
        var request = http.request(options, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                writer.send(data);
            });
        });
        request.on('error', function (e) {
            console.log(e.message);
        });
        request.end();
    }
};