'use strict';

const fs = require('fs'),
    path = require('path'),
    model = require('../api/models/fipeTableModel'),
    Promise = require('bluebird'),                                                          // Promise library
    fipeScraper = Promise.promisifyAll(require(path.join(__dirname, 'FIPEScraper.js')));    // FIPE table scraper


console.log("Initializing the database");

// Set the number of initial reference tables in the db
// Here's is where the party begins
saveFIPEFromLastReferenceTables(3);


// Save the FIPE table from the 'referenceTableId' month in a Postgres
function saveFIPEReferenceTable(referenceTableId) {
    var brands = [];

    fs.readFile(path.join(__dirname, 'brands.json'), 'utf8', function(err, data) {

        if (err) console.log("Can't read brands file: ", err);
        else brands = JSON.parse(data);

        var brandIds = brands.map( brand => parseInt(brand['Value']) );

        fipeScraper.getVehiclesFromBrandsAsync(referenceTableId, brandIds).then(function(data) {
            console.log("Table OK => ", referenceTableId);

            if (data.length > 0) {

                // Delete all old vehicles from that reference table
                model.db.result('DELETE FROM vehicles WHERE referenceTableId = $1', data[0].referenceTableId)
                    .then(function(res) {
                        console.log("Removed ", res.rowCount, " vehicles from table ", data[0].referenceTableId);
                    })
                    .catch(function(err) {
                        console.log("Error while cleaning: ", err);
                    })

                // Insert the new fetched vehicles

                model.db.tx(t => {
                    return t.batch(data.map(function(v) {
                        return t.result('INSERT INTO vehicles(value, brand, model, modelYear, fuel, fipeCode, referenceMonth, referenceTableId, brandId, modelId, yearId)' +
                                        'VALUES(${Valor}, ${Marca}, ${Modelo}, ${AnoModelo}, ${Combustivel}, ${CodigoFipe}, ${MesReferencia}, ${referenceTableId}, ${brandId}, ${modelId}, ${yearId})', v);
                    }));
                })
                .then(data => {
                    console.log("Inserted ", data.length, " vehicles into table ", referenceTableId);
                }).catch(function(err) {
                    console.log("Error while inserting: ", err);
                });
            }
        }).then(function() {
            model.db.any('select * from vehicles')
                .then(function(data) {
                    console.log("Total of vehicles: ", data.length);
                })
                .catch(function(err) {
                    console.log(err);
                })
        }).error(function(err) {
            console.log("Tabela FAIL => ", referenceTableId);
            console.log(err);
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
