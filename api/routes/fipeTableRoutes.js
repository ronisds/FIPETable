'use strict';
module.exports = function(app) {
    var fipeTable = require('../controllers/fipeTableController');

    // FIPETable Routes

    app.route('/test')
        .get(fipeTable.doTest);

    app.route('/dates')
        .get(fipeTable.listDates);

    app.route('/brands/:dateId')
        .get(fipeTable.listBrands);

    app.route('/models/:dateId/:brandId')
        .get(fipeTable.listModels);

    app.route('/years/:dateId/:brandId/:modelId')
        .get(fipeTable.listYears);

    app.route('/vehicle/:dateId/:brandId/:modelId/:yearId')
        .get(fipeTable.getVehicle);
};
