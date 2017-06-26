var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    fs = require('fs'),
    fipeHelper = require('./lib/FIPEHelper'),                           // Initialize the FIPE db and gives another helper methods
    bodyParser = require('body-parser'),                                // Middleware for reading request body
    controller = require('./api/controllers/fipeTableController'),      // Controller
    Promise = require('bluebird'),                                      // Promise library
    fipeScraper = Promise.promisifyAll(require('./lib/FIPEScraper'));   // FIPE table scraper


app.use(bodyParser.urlencoded({ extended: true }));                     // Parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                             // Parse application/json

app.set('json spaces', 1);                                              // Should remove this in production mode to minimize responses

var routes = require('./api/routes/fipeTableRoutes');                   // Routes
routes(app);

// Set the number of initial reference tables in the db
// Here's is where the party begins
console.log("Initializing the database");
fipeHelper.saveFIPEFromLastReferenceTables(3);                          // Set the number of reference tables


app.listen(port);                                                       // Start the server

console.log('FIPETable RESTful API server started on: ' + port);
