'use strict';

const fs = require('fs'),
    path = require('path'),
    model = require('../api/models/fipeTableModel'),
    Promise = require('bluebird'),                                                          // Promise library
    fipeScraper = Promise.promisifyAll(require(path.join(__dirname, 'FIPEScraper.js')));    // FIPE table scraper


// Exports the functions
exports.saveFIPEReferenceTable = saveFIPEReferenceTable;
exports.saveFIPEFromLastReferenceTable = saveFIPEFromLastReferenceTable;
exports.saveFIPEFromLastReferenceTables = saveFIPEFromLastReferenceTables;

// Save the FIPE table from the 'referenceTableId' month in a Postgres
function saveFIPEReferenceTable(referenceTableId) {
    var brands = [];

    fs.readFile(path.join(__dirname, 'brands.json'), 'utf8', function(err, data) {

        if (err) console.log("Can't read brands file: ", err);
        else brands = JSON.parse(data);

        var brandIds = brands.map( brand => parseInt(brand['Value']) );

        fipeScraper.getVehiclesFromBrandsAsync(referenceTableId, brandIds).then(function(data) {
            console.log("Table", referenceTableId, ": OK");

            if (data.length > 0) {

                // Delete all old vehicles from that reference table
                model.db.result('DELETE FROM vehicles WHERE referenceTableId = $1', data[0].referenceTableId)
                    .then(function(res) {
                        console.log("Table", referenceTableId, ": Deleted ", res.rowCount, " vehicles.");
                    })
                    .catch(function(err) {
                        console.log("Table", referenceTableId, ": Error while cleaning: ", err);
                    })

                // Insert the new fetched vehicles

                model.db.tx(t => {
                    return t.batch(data.map(function(v) {
                        return t.result('INSERT INTO vehicles(value, brand, model, modelYear, fuel, fipeCode, referenceMonth, referenceTableId, brandId, modelId, yearId)' +
                                        'VALUES(${Valor}, ${Marca}, ${Modelo}, ${AnoModelo}, ${Combustivel}, ${CodigoFipe}, ${MesReferencia}, ${referenceTableId}, ${brandId}, ${modelId}, ${yearId})', v);
                    }));
                })
                .then(data => {
                    console.log("Table", referenceTableId, ": Inserted ", data.length, " vehicles.");
                }).catch(function(err) {
                    console.log("Table", referenceTableId, ": Error while inserting: ", err);
                });
            }
        }).then(function() {
            model.db.any('select * from vehicles')
                .then(function(data) {
                    console.log("Total of vehicles in databse: ", data.length);
                })
                .catch(function(err) {
                    console.log(err);
                })
        }).error(function(err) {
            console.log("Table", referenceTableId, ": FAIL => ", err);
        });
    });
}

// Save the FIPE table from the last month in a Postgres
function saveFIPEFromLastReferenceTable() {
    fipeScraper.getReferenceTableAsync()
    .then(function(data) {
        if (data.length == 0) {
            console.log("Can't find any table");
        } else {
            let table = data[0];
            saveFIPEReferenceTable(table['code']);
        }

    });
}

// Save the FIPE table from the last numberOfReferenceTables months in a Postgres
function saveFIPEFromLastReferenceTables(numberOfReferenceTables) {

    fipeScraper.getReferenceTableAsync()
    .then(function(data) {
        let tables = data.slice(0, numberOfReferenceTables);
        console.log("Tables: ");
        console.log(tables);
        let timeout = 0;
        for(let i = 0; i < tables.length; ++i) {
            setTimeout(function(table) {
                saveFIPEReferenceTable(table['code']);
            }, timeout, tables[i]);
            timeout += 1000;
        }
    });
}
