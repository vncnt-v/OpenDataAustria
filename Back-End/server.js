const express = require('express');
const app = express();
const port = 8000;
//const port = 3002;
require('./app/routes')(app, {});
app.listen(port, () => 
{  
    console.log('We are live on ' + port);
});