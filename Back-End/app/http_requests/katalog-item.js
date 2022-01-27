module.exports = {
    getData: function (req,writer) {
        console.log(req);
        var params = req.query.url.split('/');
        var path = "";
        for(var i = 3; i < params.length; i++){
            path = path + '/' + params[i];
        }     
        for (var propName in req.query) {
            if (req.query.hasOwnProperty(propName) && propName != 'url') {
                path = path + '&' + propName + '=' + req.query[propName]
            }
        }
        var http = require('https');
        var options = {
            host: params[2],
            path: path.replace(' ','')
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