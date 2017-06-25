'use strict';

const fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),                                                          // Promise library
    fipeScraper = Promise.promisifyAll(require('../../lib/FIPEScraper.js'));    // FIPE table scraper


/////////////////////////////////////////////////
///////////// Databse configuration /////////////
/////////////////////////////////////////////////

// pg-promise initialization options
const pgOptions = {
    promiseLib: Promise // use the custom promise library
};

// db connection parameters
const pgConfig = {
    host: 'localhost',
    port: 5432,
    database: 'fipe'
};

// load and initialize pg-promise
const pgp = require('pg-promise')(pgOptions);

// create the db instance
exports.db = pgp(pgConfig);

// test
// db.any('select * from vehicles')
//     .then(function(data) {
//         console.log(data);
//     })
//     .catch(function(err) {
//         console.log(err);
//     })

/////////////////////////////////////////////////
/////////////////////////////////////////////////
