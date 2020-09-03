var express = require('express');
var fs = require('fs');
var path = require('path');

var router = express.Router();


router.get('/', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('index.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

// router.get('/home*', function(req, res, next) {
//   console.log("Served through ExpressJs");
//   res.sendFile('index.html', {
//         root: path.join(__dirname, '../../dist/')
//   });
// });

router.get('/login*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('login.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/cookie-policy', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('cookie-policy.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/blog*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('blog-details.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/press', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('press.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/pricing', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('pricing.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/error', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('page-not-found.html', {
        root: path.join(__dirname, '../../dist/')
  });
}); 

router.get('/register*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('register.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/admin-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('admin-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/my-account*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('my-account.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/help*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('help.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/buyer-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('buyer-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});
router.get('/supplier-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('supplier-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/investor-pitch*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('investor-pitch.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/market-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('marketplace-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/stores-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('store-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/finance-dashboard*', function(req, res, next) {
  console.log("Served through ExpressJs");
  res.sendFile('finance-dashboard.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/inventory*', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('inventory.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/rental*', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('rental.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/directory*', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('directory.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/supplier', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('supplier.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/about-us', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('about-us.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/company*', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('companyDetails.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/companies*', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('companyList.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/how-it-works', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('how-it-works.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/contact', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('contact.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/frequently-asked-questions', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('frequently-asked-questions.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/terms-and-conditions', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('terms-and-conditions.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

router.get('/privacy-policy', function(req, res, next) {
  console.log("Served through ExpressJs");
   res.sendFile('privacy-policy.html', {
        root: path.join(__dirname, '../../dist/')
  });
});

module.exports = router;
