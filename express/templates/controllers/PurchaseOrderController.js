var handlebars = require('handlebars');
var fs = require('fs');

handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

var PurchaseOrderService = require('../services/PurchaseOrderService');

module.exports = {
    create: function (req, res) {
        function NumInWords (number) {
            const first = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
            const tens = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
            const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
            let word = '';
           
            for (let i = 0; i < mad.length; i++) {
              let tempNumber = number%(100*Math.pow(1000,i));
              if (Math.floor(tempNumber/Math.pow(1000,i)) !== 0) {
                if (Math.floor(tempNumber/Math.pow(1000,i)) < 20) {
                  word = first[Math.floor(tempNumber/Math.pow(1000,i))] + mad[i] + ' ' + word;
                } else {
                  word = tens[Math.floor(tempNumber/(10*Math.pow(1000,i)))] + '-' + first[Math.floor(tempNumber/Math.pow(1000,i))%10] + mad[i] + ' ' + word;
                }
              }
           
              tempNumber = number%(Math.pow(1000,i+1));
              if (Math.floor(tempNumber/(100*Math.pow(1000,i))) !== 0) word = first[Math.floor(tempNumber/(100*Math.pow(1000,i)))] + 'hunderd ' + word;
            }
              return word;
           }
        var items = req.items;
        var totalPriceWithTax = 0;
        var vatAmount = 0;
        items = items.map(function (data) {
            if (data.vat) {
                var vatValue = (data.total_price * (data.vat / 100)).toFixed(2);
                data.vatValue = vatValue;
                var priceWithTax = (data.total_price * (data.vat / 100)).toFixed(2);
                data.priceWithTax = Number(data.total_price) + Number(priceWithTax);
                vatAmount ? vatAmount = Number(vatAmount)+Number(priceWithTax) :  vatAmount =  Number(priceWithTax);
                console.log("Vat Amount");
                console.log(vatAmount);     
                totalPriceWithTax = Number(totalPriceWithTax) + Number(data.priceWithTax);
            } else {
                data.priceWithTax = data.total_price;
                totalPriceWithTax = Number(totalPriceWithTax) + Number(data.priceWithTax);
            }

            return data;
        });
        req.vatAmount = vatAmount;
        console.log("Vat Amount in REQ");
        req.totalPriceWithTax = totalPriceWithTax;
        req.totalPriceInWords = NumInWords(parseInt(req.totalPriceWithTax));
        // req.totalPriceWithTax = (parseFloat(data.price_number) + parseFloat(priceWithTax)).toFixed(2);
        // req.totalPriceInWords = this.inWords(req.totalPriceWithTax);
        req.items = items;
        return PurchaseOrderService.
            getPurchaseOrder(req).then(function (res) {
                return res;
            });
    },

};
