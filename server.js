var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    fs = require('fs'),
    fipeHelper = require('./lib/FIPEHelper'),                           // Initialize the FIPE db and gives another helper methods
    bodyParser = require('body-parser'),                                // Middleware for reading request body
    controller = require('./api/controllers/fipeTableController'),      // Controller

    Promise = require('bluebird'),                                      // Promise library
    fipeScraper = Promise.promisifyAll(require('./lib/FIPEScraper'));   // FIPE table scraper


app.use(bodyParser.urlencoded({ extended: true }));     // Parse application/x-www-form-urlencoded
app.use(bodyParser.json());                             // Parse application/json

var routes = require('./api/routes/fipeTableRoutes');                   // Routes
routes(app);

app.listen(port);

console.log('FIPETable RESTful API server started on: ' + port);
