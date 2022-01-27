var katalog_item = require('../http_requests/katalog-item.js');
var open_data_wfs_katalog = require('../http_requests/open-data-wfs-katalog.js');
var serverstatus = require('../http_requests/serverstatus.js');
var map = require('../http_requests/map.js');

module.exports = function(app) {  
    app.get('/serverstatus', (req, res) => { serverstatus.getData(res)  });
    app.get('/katalog-item', (req, res) => { katalog_item.getData(req,res)  });
    app.get('/map-data', (req, res) => { map.getData(res)  });
    app.get('/open-data-wfs-katalog', (req, res) => { open_data_wfs_katalog.getData(res)  });
};
