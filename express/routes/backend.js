var express = require('express');
var path = require('path');
var http = require('http');
var request = require('request');
const sgMail = require('@sendgrid/mail');
var POController = require('../templates/controllers/PurchaseOrderController.js');
var SOController = require('../templates/controllers/SalesOrderController.js')
var InvoiceController = require('../templates/controllers/InvoiceController.js');
var PackingItemsController =require('../templates/controllers/PackingItemsController.js')
var router = express.Router();

const SENDGRID_API_KEY = (process.env.SENDGRID_API_KEY||'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');
const host = (process.env.HOST||'https://www.supplierscave.com');
const access_username = process.env.USERNAME || 'admin@supplierscave.com'
const access_password = process.env.PASSWORD || 'supplierscave'
const production = (process.env.PRODUCTION || false);

sgMail.setApiKey(SENDGRID_API_KEY);

var getBackendToken = function(callback){
  request.post(
    host+'/api/token-auth/',
    { json: { username: access_username, password: access_password } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
          console.log(body);
          return callback(false, body.token);
      }else{
        console.log('error: '+error+' response: '+response);
        return callback(true, error);
      }
    }
  ); 
}

var getUserDetails = function(userId, token, callback){
  request.get(
    host+'/api/v1/user/'+userId, // url
    { // options
      headers: {
        'Authorization': 'Token '+token
      }
    },
    function(error, response, user){
      return callback(false, JSON.parse(user))
    }
  )
}

var updateUserDetails = function(userId, data, token, callback){
  console.log(JSON.stringify(data))
  request.put(
    host+'/api/v1/user/'+userId+'/', // url
    {// data
      headers: {
        'Authorization': 'Token '+token
      },
      body: data,
      json: true
    },
    function (error, response, body) {
      console.log(body)
      if (!error && response.statusCode == 200) {
          return callback(false, body);
      }else{
        return callback(true, response);
      }
    }
  )
};


function sendWelcomeEmail(user){
  // Template Id
  const template_id = 'd73c07d3-102c-4e66-af60-134b6033668c';
  console.log('user: '+user);
  var msg = {
      from: 'no-reply@supplierscave.com',
      to: user.email,
      substitutionWrappers: [':', ''],
      substitutions: {
        firstName: user.first_name
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      console.log('Error in sending welcome email '+ error);
    }else{
      console.log('Sent welcome email to '+user.email);
    }
  });
}

// using /backend routes
router.get('/verify-email/:userId/:userVerificationKey', function(req, res, next) {
  
  var userId = req.params.userId;
  var userVerificationKey = req.params.userVerificationKey;
  
  getBackendToken(function(error, token){
    if(error){
      res.send("Since backend as a is user not configured, therefore access token is not created.")
    }else{
      getUserDetails(userId, token, function(error, user){
        if(error){
          res.send("Error in getting user details");
        }else{
          if(user.email_verification_hash == userVerificationKey){
            data = {
              is_email_verified : true
            }
            updateUserDetails(userId, data, token, function(error, body){
              if(error){
                res.send(body)
                //res.send("Error in updating user details")
              }
              else{
                sendWelcomeEmail(user);
                // res.send("Email Authenticated");
                res.redirect('/?emailVerified='+true);
              }
            });
          }else{
            res.send("Verification Key not matched"+user.email_verification_hash+" == "+userVerificationKey);
          }
        }
      })
    }
  });
   
});

router.get('/get-aloglia-keys',function(req,res,next){
  console.log('Production: '+production);
  if(production){
    console.log('Returning aloglia production keys');
    res.send({'appId':'Q9C2SXQKQC','apiKey': '09c854711dca646aa25a63cc41459f9d'});
  }else{
    console.log('Returning aloglia local/staging keys');
    res.send({'appId':'DZHPH1GLRQ','apiKey': '1346fa35aca2c82f4f97fd75c0afdc15'});
  }
});

// print purchase order API
router.post('/print-po',function(req,res,next){
   var data = req.body.poData;
   POController.create(data).then(function(template){
     console.log("Response in backend");
     console.log(template);
     res.send(template);
   },function(err){
        console.log(err);
   });
});


// print Invoice form API
router.post('/print-invoice',function(req,res,next){
  console.log('inside backend invoice file');
   var data = req.body.invoiceData;
   console.log('calling post method');
   InvoiceController.create(data).then(function(template){
     console.log("Response in invoice backend");
     console.log(template);
     res.send(template);
   },function(err){
        console.log("error in invoice backend");
   });
});

// Print Sales Order API
router.post('/print-so',function(req,res,next){
   var data = req.body.soData;
   SOController.create(data).then(function(template){
     console.log("Response in SO Order backend");
     console.log(template);
     res.send(template);
   },function(err){
        console.log("error in SO Order backend");
   });
});

// Print Packing Items API
router.post('/print-packing-items',function(req,res,next){
  var data = req.body.plData;
  PackingItemsController.create(data).then(function(template){
    console.log("Response in Packing Items backend");
    console.log(template);
    res.send(template);
  },function(err){
       console.log("error in Packing Items backend");
  });
});


module.exports = router;
