module.exports = {
    getData: function (writer) {
        var http = require('https');
        var options = {
            host: 'covid19-dashboard.ages.at',
            path: '/data/CovidFaelle_GKZ.csv'
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