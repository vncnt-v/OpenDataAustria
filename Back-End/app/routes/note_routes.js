var corona = require('../http_requests/corona.js');
var map = require('../http_requests/map.js');
var corona = require('../http_requests/corona.js');
module.exports = function(app) {  
    app.get('/corona', (req, res) => { corona.getData(res)  });
    app.get('/map', (req, res) => { map.getData(res)  });
};
