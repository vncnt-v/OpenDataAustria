var fs = require('fs');

module.exports = {
    getData: function (writer) {
        fs.readFile('./app/data/map.json','utf8', function(err, data) {
            if (err){
                return console.log(err);
            }
            writer.send(data);
          });
    }
};