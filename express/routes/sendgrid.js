const sgMail = require('@sendgrid/mail');
var express = require('express');
var path = require('path');

var router = express.Router();


const SENDGRID_API_KEY = (process.env.SENDGRID_API_KEY||'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');
const host = (process.env.HOST||'https://www.supplierscave.com');
const uiHost = (process.env.HOST||'https://www.supplierscave.com');

sgMail.setApiKey(SENDGRID_API_KEY);

// using /sendgrid routes
router.get('/verify-email', function(req, res, next) {

  // Template Id
  const template_id = '8d9cbd05-9a6f-42bb-9c45-9555cab05acf';
  // Get data from query params
  var userId = req.query.userId;
  var userEmail = req.query.userEmail;
  var userName = req.query.userName;
  var userVerificationKey = req.query.userVerificationKey;
  console.log(process.env.HOST);
  console.log("Host: "+host);
  var msg = {
      from: 'no-reply@supplierscave.com',
      to: userEmail,
      substitutionWrappers: [':', ''],
      substitutions: {
        firstName: userName,
        link: host+'/backend/verify-email/'+userId+'/'+userVerificationKey
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });

});

router.get('/verify-team-member', function(req, res, next) {
  
    // Template Id
    const template_id = 'f4a3bed9-b6d7-4dc5-82a9-d0ff1b2c9621';
    // Get data from query params
    var companyId = req.query.companyId;
    var userEmail = req.query.userEmail;
    var userName = req.query.userName;
    var supplier = req.query.company;
    var supplierAdmin = req.query.companyAdmin
    var emailId = userEmail.replace('+','%2B');
    
    var msg = {
        from: 'no-reply@supplierscave.com',
        to: userEmail,
        substitutionWrappers: [':', ''],
        substitutions: {
          firstName: userName,
          supplierAdmin: supplierAdmin,
          teamName: supplier,
          link: host+'/register/options?email='+emailId+'&companyId='+companyId
        },
        template_id: template_id
    };
  
    sgMail.send(msg, function(error, response){
      if(error){
        res.send(error)
      }else{
        res.send("Success");
      }
    });
  
  });

// using /sendgrid routes
router.get('/forgot-password', function(req, res, next) {

  // Template Id
  const template_id = '70c78ec7-c5bc-40ae-93cf-d225ebcf5a26';
  // Get data from query params
  var userEmail = req.query.userEmail;
  var emailId = userEmail.replace('+','%2B');
  var msg = {
      from: 'no-reply@supplierscave.com',
      to: userEmail,
      substitutionWrappers: [':', ''],
      substitutions: {
        firstName: userEmail,
        link: uiHost+'/register/forgot-password?email='+emailId
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });

});

router.get('/send-support-email', function(req, res, next) {
  
  // Template Id
  const template_id = '8228df4d-16a7-4862-81bc-7f4f6b519451';
  // Get data from query params
  var userEmail = req.query.userEmailId;
  var firstName = req.query.userName;
  var userContactNo = req.query.userContactNo;
  var message = req.query.message;
  var toEmail = 'info@supplierscave.com';
  var date = new Date();

  var msg = {
      from: 'no-reply@supplierscave.com',
      to: toEmail,
      substitutionWrappers: [':', ''],
      substitutions: {
        firstName: firstName,
        userEmail: userEmail,
        userContactNo: userContactNo,
        message: message,
        date: date.toString()
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });

});

router.get('/send-Enquiry', function(req, res, next) {
    console.log('Inside send-enquiry');
    // Template Id
    const template_id = 'd-b7c8e93fd1f04ba5a63c2d026a9a8e83';
    // Get data from query params
    var suppliers = JSON.parse(req.query.suppliers);
    console.log("Suppliers: "+suppliers)
    if(!Array.isArray(suppliers)){
      console.log("inside if array")
      suppliers = [suppliers];
    }
    var data = JSON.parse(req.query.emailBody);
    var personalizations = suppliers.map(function(supplier,$index){
      supplier.items.map(function(item){
        item.url = host+item.url;
      });
      var obj = {};
      obj.to = supplier.email;
      obj.dynamic_template_data = {
        supplierName: supplier.name,
        data:data,
        itemsCount: supplier.itemsCount,
        items: supplier.items
      };
      return obj;
    });
    const msg = {
        from: "info@supplierscave.com",
        personalizations: personalizations,
        template_id: template_id
    };

    sgMail.send(msg, function(error, response){
      if(error){
        res.send(error)
      }else{
        res.send("Success");
      }
    });
});

router.get('/send-Enquiry-single', function(req, res, next) {
  console.log('Inside send-enquir-single');
  // Template Id
  const template_id = 'd-b7c8e93fd1f04ba5a63c2d026a9a8e83';
  // Get data from query params
  var supplier = JSON.parse(req.query.supplier);
  var data = JSON.parse(req.query.emailBody);
  supplier.items.map(function(item){
    item.url = host+item.url;
  });
  const msg = {
      from: "info@supplierscave.com",
      to: req.query.supplierEmail,
      dynamic_template_data : {
        supplierName: supplier.name,
        data:data,
        itemsCount: supplier.itemsCount,
        items: supplier.items
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });
});

router.get('/company-send-Enquiry', function(req, res, next) {
  console.log('Inside send-enquiry');
  // Template Id
  const template_id = 'f429a733-e0b5-42ce-ad0d-17c59a76fe3d';
  // Get data from query params
  var buyerName = req.query.buyerName;//loginperson
  var companyName = req.query.companyName;
  var userEmail = req.query.userEmail;
  var message = req.query.message;
  var senderEmail = req.query.senderEmail;
  var date = new Date();
  var msg = {
      from: userEmail,
      to: senderEmail,
      substitutionWrappers: [':', ''],
      substitutions: {
        companyName:companyName,
        message: message,
        buyerName:buyerName,
        userEmail:userEmail,
        date: date.toString()
      },
      template_id: template_id
  }

sgMail.send(msg, function(error, response){
  if(error){
    res.send(error)
  }else{
    res.send("Success");
  }
});
});

router.get('/send-product-email', function(req, res, next) {
  // Template Id
  const template_id = '8b11baa4-0803-439f-a6f8-9aa40101da18';
  // Get data from query params
  var Admin = req.query.admin;
  var firstName = req.query.firstName;
  var link = req.query.link;
  var count = req.query.count;
  var date = new Date();
  var msg = {
      from: Admin,
      to: firstName,
      substitutionWrappers: [':', ''],
      substitutions: {
        firstName: firstName,
        Admin: Admin,
        link: link,
        count:count,
        date: date.toString()
      },
      template_id: template_id
  }

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    } 
  });
});

router.get('/admin-send-enquiry', function(req, res, next) {
  
  // Template Id
  const template_id = 'd-ff06ccee1a564eceaf310373457c3c30';
  var supplierEmail = req.query.supplierEmail;
  if(!Array.isArray(supplierEmail)){
    console.log("inside if array")
    supplierEmail = [supplierEmail];
  }
  console.log("Inside send grid admin send enqyiry");
  var data = JSON.parse(req.query.emailBody);
  data.url = host +'/supplier-dashboard/enquiries/viewEnquiry/'+data.viewEnquiry+"?type=Received";
  var personalizations = supplierEmail.map(function(supplier,$index){
    var obj = {};
    obj.to = supplier;
    obj.dynamic_template_data = {
      data:data
    };
    return obj;
  });
  const msg = {
      from: {email: data.senderEmail?data.senderEmail:"info@supplierscave.com",name:data.senderName},
      personalizations: personalizations,
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });
});

router.get('/admin-send-offer', function(req, res, next) {
  
  // Template Id
  const template_id = 'd-f9fe36fb96ee4f858446b3e6876fffa2';
  console.log("Inside send grid admin send enqyiry");
  var to = req.query.to;
  var data = JSON.parse(req.query.emailBody);
  const msg = {
      from: "info@supplierscave.com",
      to: to,
      dynamic_template_data:{
        data: data,
        subject: 'Test subject'
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });

});

router.get('/po-send-email', function(req, res, next) {
  
  // Template Id
  const template_id = 'd-384d925c072b4cab997176104b052337';
  var to = req.query.to;
  var buyerEmail = req.query.buyerEmail;
  var buyerName = req.query.buyerName;
  console.log("step 1");
  var data = JSON.parse(req.query.emailBody);
  data.url = host +'/buyer-dashboard/orders/view/'+data.POId;
  console.log("step 2");
  const msg = {
      from: {email: buyerEmail? buyerEmail:"info@supplierscave.com",name:buyerName},
      to: to,
      dynamic_template_data:{
        po: data,
      },
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });

});

router.get('/contact-company', function(req, res, next) {
  console.log('Inside contact company');
  // Template Id
  const template_id = 'd-5354c2fb739b46b3bb1e65a1d1401043';
  // Get data from query params
  var companyEmail = req.query.companyEmail;
  var companyName = req.query.companyName;
  var message = req.query.emailBody;
  var senderName = req.query.senderName;
  var senderEmail = req.query.senderEmail;
  var attachment = req.query.attachment;
  var personalizations = [];
  console.log(companyEmail,companyName,message,senderName,senderEmail)
  var obj = {};
  obj.to = companyEmail;
  obj.dynamic_template_data = {
    companyName: companyName,
    senderName: senderName,
    senderEmail: senderEmail,
    message:message
  };
  if(attachment){
    obj.dynamic_template_data.attachments = [attachment];
  }
  personalizations.push(obj);
  const msg = {
      from: "info@supplierscave.com",
      personalizations: personalizations,
      template_id: template_id
  };

  sgMail.send(msg, function(error, response){
    if(error){
      res.send(error)
    }else{
      res.send("Success");
    }
  });
});
module.exports = router;
