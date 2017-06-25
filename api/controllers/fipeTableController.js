'use strict';
const model = require('../models/fipeTableModel');

exports.doTest = function(req, res) {
    res.send("Hello World!?!");
};

exports.listDates = function(req, res) {
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

exports.listBrands = function(req, res) {
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

exports.listModels = function(req, res) {
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

exports.listYears = function(req, res) {
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

exports.getVehicle = function(req, res) {
    model.db.any('select * from vehicles WHERE referenceTableId = ${dateId} AND brandid = ${brandId} AND modelid = ${modelId} AND yearid = ${yearId}', req.params)
        .then(function(data) {
            if (data.length > 0) res.json(data[0]);
            else res.json(data);
        })
        .catch(function(err) {
            console.log(err);
            next(err);
        });
}
