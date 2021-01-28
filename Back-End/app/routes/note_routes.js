var corona = require('../http_requests/corona.js');
var map = require('../http_requests/map.js');
var impfung = require('../http_requests/impfung.js');
module.exports = function(app) {  
    app.get('/corona-data', (req, res) => { corona.getData(res)  });
    app.get('/impfung-data', (req, res) => { impfung.getData(res)  });
    app.get('/map-data', (req, res) => { map.getData(res)  });
};
