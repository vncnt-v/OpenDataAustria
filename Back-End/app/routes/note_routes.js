var corona = require('../http_requests/corona.js');
var map = require('../http_requests/map.js');
var impfung = require('../http_requests/impfung.js');
module.exports = function(app) {  
    app.get('/corona', (req, res) => { corona.getData(res)  });
    app.get('/impfung', (req, res) => { impfung.getData(res)  });
    app.get('/map', (req, res) => { map.getData(res)  });
};
