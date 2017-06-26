'use strict';

const osmosis = require('osmosis'),     // Web scraper (used only to get the ids of the reference tables)
    request = require('request'),       // HTTP client
    Promise = require('bluebird');      // Promise library

exports.getVehiclesFromBrands = getVehiclesFromBrands;
exports.getVehicle = getVehicle;
exports.getVehicleFromFipeCode = getVehicleFromFipeCode;
exports.getReferenceTable = getReferenceTable;
exports.getBrands = getBrands;
exports.getModels = getModels;
exports.getYears = getYears;

// Default request options
var defaultRequestOptions = {
    url: "http://veiculos.fipe.org.br",
    headers: { 'Referer': 'http://veiculos.fipe.org.br/' },
    form: { codigoTipoVeiculo: '1' }                       // Vehicle type restricted to cars
};

var getVehicleAsync = Promise.promisify(getVehicle);
var getModelsAsync = Promise.promisify(getModels);
var getBrandsAsync = Promise.promisify(getBrands);
var getYearsAsync = Promise.promisify(getYears);

const MaximumOfModelsByBrand = 2;
const MaximumOfYearsByModels = 1;

// Get all vehicles from a list of brands and a specific month/year
function getVehiclesFromBrands(referenceTableId, brandIdsList, callback) {

    Promise.map(brandIdsList, function(brandId) {   // Get the models by brandId
        return getModelsAsync(referenceTableId, brandId);
    }).then(function(modelsFromBrands) {            // Get the years by brandId and modelId

        // List all models (max of MaximumOfModelsByBrand by brand)
        var allModels = [].concat.apply([], modelsFromBrands.map( modelsFromBrand => modelsFromBrand.slice(0, MaximumOfModelsByBrand )));

        return Promise.map(allModels, function(model) {
            return getYearsAsync(referenceTableId, model.brandId, model.Value);
        });

    }).then(function(yearsFromModels) {             // Get the vehicles by brandId, modelId and yearId

        // List all years (max of MaximumOfYearsByModels by model)
        var allYears = [].concat.apply([], yearsFromModels.map( yearsFromModel => yearsFromModel.slice(0, MaximumOfYearsByModels )));

        return Promise.map(allYears, function(year) {
            return getVehicleAsync(referenceTableId, year.brandId, year.modelId, year.Value);
        });

    }).then(function(vehicles) {
        callback(null, vehicles);   // Pass the results to the callback
    }).error(function(err) {
        callback(err, null);        // Error
    });
}

// Get vehicle from FIPE table using all vehicle parameters
function getVehicle(referenceTableId, brandId, modelId, yearId, callback) {

    // First check the yearId param
    try {
        var yearAndFuel = extractYearAndFuel(yearId);
    } catch(err) {
        callback(err, null);
    }

    // Request options
    let options = JSON.parse(JSON.stringify(defaultRequestOptions));
    options.url += '/api/veiculos/ConsultarValorComTodosParametros';
    options.form.codigoTabelaReferencia = referenceTableId;
    options.form.codigoMarca = brandId;
    options.form.codigoModelo = modelId;
    options.form.anoModelo = yearAndFuel.year;
    options.form.codigoTipoCombustivel = yearAndFuel.fuel;
    options.form.tipoConsulta = 'tradicional';

    // Make the request
    request.post(options, function(err, res, body) {
        if (!err) {
            // Check of body contains a valid JSON
            try {

                let vehicle = JSON.parse(body);

                // Check if the result indicates an error
                if (typeof vehicle.erro !== 'undefined') callback(new Error("FIPE returns an error: \'".concat(vehicle.erro).concat("\'")), null);
                else {

                    vehicle['referenceTableId'] = referenceTableId;
                    vehicle['brandId'] = brandId;
                    vehicle['modelId'] = modelId;
                    vehicle['yearId'] = yearId;

                    callback(null, vehicle); // It's all right
                }

            } catch(err) {
                callback(err, null); // Error in parsing. The body ins't a valid JSON
            }
        } else {
            callback(err, null); // Error in the request
        }
    });
}

// Get vehicle from FIPE table using the FIPE code
function getVehicleFromFipeCode(referenceTableId, yearId, fipeCode, callback) {

    // First check the yearId param
    try {
        var yearAndFuel = extractYearAndFuel(yearId);
    } catch(err) {
        callback(err, null);
    }

    // Request options
    let options = JSON.parse(JSON.stringify(defaultRequestOptions));
    options.url += '/api/veiculos/ConsultarValorComTodosParametros';
    options.form.codigoTabelaReferencia = referenceTableId;
    options.form.anoModelo = yearAndFuel.year;
    options.form.codigoTipoCombustivel = yearAndFuel.fuel;
    options.form.modeloCodigoExterno = fipeCode;
    options.form.tipoConsulta = 'codigo';

    // Make the request
    request.post(options, function(err, res, body) {
        if (!err) {
            // Check of body contains a valid JSON
            try {

                let vehicle = JSON.parse(body);

                // Check if the result indicates an error
                if (typeof vehicle.erro !== 'undefined') callback(new Error("FIPE returns an error: \'".concat(vehicle.erro).concat("\'")), null);
                else {

                    vehicle['referenceTableId'] = referenceTableId;
                    vehicle['brandId'] = brandId;
                    vehicle['modelId'] = modelId;
                    vehicle['yearId'] = yearId;

                    callback(null, vehicle); // It's all right
                }

            } catch(err) {
                callback(err, null); // Error in parsing. The body ins't a valid JSON
            }
        } else {
            callback(err, null); // Error in the request
        }
    });
}

// Scrap the ids of the reference table
function getReferenceTable(callback) {

    let results = [];

    osmosis
        .get(defaultRequestOptions.url)
        .find('#selectTabelaReferenciacarroCodigoFipe > option')
        .set('data')
        .set({
            'code': '@value',
        })
        .data(function(data) {
            results.push(data);
        })
        .error(function(err) {
            callback(err, null);
        })
        .debug(console.log)
        .done(function() {
            callback(null, results);
        });
}

// Brands
function getBrands(referenceTableId, callback) {

    let options = JSON.parse(JSON.stringify(defaultRequestOptions));
    options.url += '/api/veiculos/ConsultarMarcas';
    options.form.codigoTabelaReferencia = referenceTableId;

    request.post(options, function(err, res, body) {
        if (!err) {

            // Check of body contains a valid JSON
            try {

                var result = JSON.parse(body);

                // Check if the result indicates an error
                if (typeof result.erro !== 'undefined') callback(new Error("FIPE returns an error: \'".concat(result.erro).concat("\'")), null);
                else { // It's all right
                    var brands = JSON.parse(body).map(function(brand) {
                        brand['referenceTableId'] = referenceTableId;
                        return brand;
                    });
                    callback(null, brands);
                }

            } catch(err) {
                callback(err, null); // Error in parsing. The body ins't a valid JSON
            }


        } else {
            callback(err, null);
        }
    });
}

// Models
function getModels(referenceTableId, brandId, callback) {

    let options = JSON.parse(JSON.stringify(defaultRequestOptions));
    options.url += '/api/veiculos/ConsultarModelos';
    options.form.codigoTabelaReferencia = referenceTableId;
    options.form.codigoMarca = brandId;

    request.post(options, function(err, res, body) {
        if (!err) {

            // Check of body contains a valid JSON
            try {

                var result = JSON.parse(body);

                // Check if the result indicates an error
                if (typeof result.erro !== 'undefined') callback(new Error("FIPE returns an error: \'".concat(result.erro).concat("\'")), null);
                else { // It's all right
                    var models = JSON.parse(body)['Modelos'].map(function(model) {
                        model['referenceTableId'] = referenceTableId;
                        model['brandId'] = brandId;
                        return model;
                    });
                    callback(null, models);
                }

            } catch(err) {
                callback(err, null); // Error in parsing. The body ins't a valid JSON
            }


        } else {
            callback(err, null);
        }
    });
}

// Year model
function getYears(referenceTableId, brandId, modelId, callback) {

    let options = JSON.parse(JSON.stringify(defaultRequestOptions));
    options.url += '/api/veiculos/ConsultarAnoModelo';
    options.form.codigoTabelaReferencia = referenceTableId;
    options.form.codigoMarca = brandId;
    options.form.codigoModelo = modelId;

    request.post(options, function(err, res, body) {
        if (!err) {
            // Check of body contains a valid JSON
            try {

                var result = JSON.parse(body);
                // Check if the result indicates an error
                if (typeof result.erro !== 'undefined') callback(new Error("FIPE returns an error: \'".concat(result.erro).concat("\'")), null);
                else { // It's all right
                    var years = JSON.parse(body).map(function(year) {
                        year['referenceTableId'] = referenceTableId;
                        year['brandId'] = brandId;
                        year['modelId'] = modelId;
                        return year;
                    });
                    callback(null, years);
                }

            } catch(err) {
                callback(err, null); // Error in parsing. The body ins't a valid JSON
            }


        } else {
            callback(err, null);
        }
    });
}

// Helper method to extract year and fuel type from yearId
function extractYearAndFuel(yearId) {

    // Extract year and fuel type
    let year = yearId.split('-')[0],
        fuel = yearId.split('-')[1];

    // Check if the yearId has the correct format ('year-fuelTypeId')
    if (typeof year !== 'string' || typeof fuel !== 'string') throw new Error("Invalid yearId. The yearId parameter must have the format \'year-fuelTypeId\'");

    return { year: year, fuel: fuel };
}
