module.exports = {
    getData: function (writer) {
        var http = require('https');
        var options = {
            host: 'www.data.gv.at',
            path: '/katalog/api/3/action/package_search?q=json%20(wfs)&rows=500'     
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