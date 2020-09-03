var handlebars = require('handlebars');
var fs = require('fs');

handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

var PackingItemsService = require('../services/PackingItemsService.js');

module.exports = {
    create:function(req, res){
        var items = req.items;
        var totalNetWeight = 0;
        var totalGrossWeight = 0;
        items = items.map(function (data) {
            console.log('Inside loop function');
            if (data.net_weight) {
                totalNetWeight ? totalNetWeight = Number(totalNetWeight) + Number (data.net_weight) : totalNetWeight = Number(data.net_weight);
            }  
            if (data.gross_weight) {
                totalGrossWeight ? totalGrossWeight = Number(totalGrossWeight) + Number (data.gross_weight) : totalGrossWeight = Number(data.gross_weight);
            }  


            return data;
        });
        req.totalNetWeight = totalNetWeight;
        req.totalGrossWeight = totalGrossWeight;
        req.items = items;
       return PackingItemsService.
       getPackingItemsService(req).then(function(data){
            return data;
        });
   },
   
};

