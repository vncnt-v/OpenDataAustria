var corona = require('../http_requests/corona.js');
var map = require('../http_requests/map.js');
var impfung = require('../http_requests/impfung.js');
var police = require('../http_requests/police.js');
const badegewaesser = require('../http_requests/badegewaesser.js');
module.exports = function(app) {  
    app.get('/corona-data', (req, res) => { corona.getData(res)  });
    app.get('/impfung-data', (req, res) => { impfung.getData(res)  });
    app.get('/map-data', (req, res) => { map.getData(res)  });
    app.get('/police-data', (req, res) => { police.getData(res)  });
    app.get('/badegewaesser-data', (req, res) => { badegewaesser.getData(res)  });
};
