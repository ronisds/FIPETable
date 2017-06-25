'use strict';
const model = require('../models/fipeTableModel');

exports.listDates = function(req, res, next) {
    model.db.any('select referencemonth, referencetableid from vehicles')
        .then(function(data) {
            let results = {};
            for(let i = 0; i < data.length; ++i) {
                results[data[i].referencetableid] = data[i].referencemonth;
            }
            console.log("Amount of dates: ", Object.keys(results).length);
            res.json(results);
        })
        .catch(function(err) {
            console.log(err);
        })
}

exports.listBrands = function(req, res, next) {
    model.db.any('select brand, brandid from vehicles WHERE referenceTableId = ${dateId}', req.params)
        .then(function(data) {
            let results = {};
            for(let i = 0; i < data.length; ++i) {
                results[data[i].brandid] = data[i].brand;
            }
            console.log("Amount of dates: ", Object.keys(results).length);
            res.json(results);
        })
        .catch(function(err) {
            console.log(err);
            next(err);
        });
}

exports.listModels = function(req, res, next) {
    model.db.any('select model, modelid from vehicles WHERE referenceTableId = ${dateId} AND brandid = ${brandId}', req.params)
        .then(function(data) {
            let results = {};
            for(let i = 0; i < data.length; ++i) {
                results[data[i].modelid] = data[i].model;
            }
            console.log("Amount of dates: ", Object.keys(results).length);
            res.json(results);
        })
        .catch(function(err) {
            console.log(err);
            next(err);
        });
}

exports.listYears = function(req, res, next) {
    model.db.any('select yearid from vehicles WHERE referenceTableId = ${dateId} AND brandid = ${brandId} AND modelid = ${modelId}', req.params)
        .then(function(data) {
            console.log("Amount of dates: ", data.length);
            res.json(data);
        })
        .catch(function(err) {
            console.log(err);
            next(err);
        });
}

exports.getVehicle = function(req, res, next) {
    let query = 'SELECT * FROM vehicles';
    if (typeof req.params.dateId !== 'undefined') {
        query += ' WHERE referenceTableid = ${dateId}';
        if (typeof req.params.brandId !== 'undefined') {
            query += ' AND brandid = ${brandId}';
            if (typeof req.params.modelId !== 'undefined') {
                query += ' AND modelid = ${modelId}';
                if (typeof req.params.yearId !== 'undefined') {
                    query += ' AND yearid = ${yearId}';
                }
            }
        }
    }

    console.log("Request: ", req.params);
    console.log(query);
    //'SELECT * FROM vehicles WHERE referenceTableId = ${dateId} AND brandid = ${brandId} AND modelid = ${modelId} AND yearid = ${yearId}', req.params

    model.db.any(query, req.params)
        .then(function(data) {
            res.json(data);
        })
        .catch(function(err) {
            console.log(err);
            next(err);
        });
}

// error handler
// should change when in production to not delivery stacktraces to user
exports.errorHandler = function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', { err });
}
