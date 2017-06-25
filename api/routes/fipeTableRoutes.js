'use strict';
module.exports = function(app) {
    var fipeTable = require('../controllers/fipeTableController');

    // FIPETable Routes

    app.get('/dates', fipeTable.listDates);

    app.get('/brands/:dateId', fipeTable.listBrands);

    app.get('/models/:dateId/:brandId', fipeTable.listModels);

    app.get('/years/:dateId/:brandId/:modelId', fipeTable.listYears);

    app.get('/vehicles/:dateId?/:brandId?/:modelId?/:yearId?', fipeTable.getVehicle);

    app.use(fipeTable.errorHandler);

};
