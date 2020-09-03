
var handlebars = require('handlebars');
var fs = require('fs');

var InvoiceService = {
    getInvoiceService : getInvoiceService
};

module.exports = InvoiceService;

function getInvoiceService(req,res){
    console.log("Service inside function 1");
    return new Promise(function(resolve, reject){ 

    var html = '';
    var readStream = fs.createReadStream(process.cwd() + '/express/templates/assets/printInvoice.html');
    readStream.
        on('data', function (chunk) {
            html += chunk;
        }).
        on('end', function () {
            // console.log('ok I am done');
            // console.log(html);

            compile(html,req, resolve, reject);
        });

    });
}

function compile(templateHtml,req, resolve,reject){
    
        try {
            var template    = handlebars.compile(templateHtml);
            var html        = template(req); 
            var htmlDoc = '<!DOCTYPE html><html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.js"></script></head><body>' + html + '<script>var template = $("#entry-template").html();var templateScript = Handlebars.compile(template);var context = '+ req.invoiceData +'var html = templateScript(req.invoiceData);$("body").append(html);</script></body></html>';
            fs.writeFile("/home/nsspl/print-sales-order/test.html", htmlDoc, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
            resolve(html);
        } catch (e) {
            reject(e);
        }
     }



