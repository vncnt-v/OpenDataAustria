module.exports = {
    getData: function (writer) {
        var http = require('https');
        var options = {
            host: 'www.data.gv.at',
            path: '/katalog/dataset/4e5c9414-2886-462e-b19f-a598ad065522/resource/5a071d1a-a16f-44d2-8f38-daff2e902153/download/polizeidienststellen_ogd.csv'
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