var handlebars = require('handlebars');
var fs = require('fs');

handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

var InvoiceService = require('../services/InvoiceService.js');

module.exports = {
    create:function(req, res){
        var items = req.items;
        var vatAmount = 0;
        items = items.map(function(data){
            if(data.vat_value){
                var value = Number(data.total_price) * Number(data.vat_value / 100);
                vatAmount ? vatAmount = Number(vatAmount)+Number(value) :  vatAmount =  Number(value);
            }
            return data;
        });

        req.vatAmount = vatAmount;
        req.items = items;
       return InvoiceService.
       getInvoiceService(req).then(function(data){
            return data;
        });
   },
   
};

