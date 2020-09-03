(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
        $stateProvider
        
        .state('layout.standard.companyList',{
            url: '/companies',
            abstract: true,
            // resolve: { 
            //     loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            //         return $ocLazyLoad.load([
            //             '/assets/js/modules/company/company-list/company-list.js']);
            //     }]
            // }
        })
        .state('layout.standard.companyList.list',{
            url: '/list',
            abstract: true,
            templateUrl: '/assets/js/modules/company/company-list/company-list.html',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/modules/directory/states/list/directory-list.css'
                    ]);
                }]
            }
        })
        .state('layout.standard.companyList.list.views',{
            url: '?type',
            views: {
                filters: {
                    templateUrl: '/assets/js/modules/company/company-list/views/company-list-filters.html'
                },
                content: {
                    templateUrl: '/assets/js/modules/company/company-list/views/company-list-content.html',
                    controller: 'company.list.content.controller'
                }
            },
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/modules/company/company-list/views/company-list-content.js',
                        '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                        '/assets/js/directives/dropdown/dropdown.js',
                        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                        '/assets/js/tinymce/tinymce.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                        '/assets/js/services/message-service.js',
                        '/assets/js/directives/file-upload.js',
                        '/assets/js/bower/aws-sdk.min.js',
                        '/assets/js/modules/common/services/s3-service.js',
                        '/assets/js/bower/ng-lodash.min.js'
                    ]);
                }]
            }
        }).state('layout.standard.companyIntro',{
            url: '',
            abstract: true,
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js',
                        '/assets/js/modules/common/services/common-services.js',
                        '/assets/js/services/parent-category-service.js',
                        '/assets/js/services/category-service.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/companyLogin.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/companyLogin.js',
                        'assets/js/modules/company/company-details/company-details.js',
                        '/assets/js/services/project-service.js',
                    ]);
                }]
            }
        })
        .state('layout.standard.companyIntro.intro',{
            url: '/company/:companyName?{companyId}',
            templateUrl: 'assets/js/modules/company/company-details/company-details.html',
            controller: 'layout.company.controller',
            params:{
                description:null
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name : 's3Service',
                        files:['/assets/js/directives/file-upload.js',
                        '/assets/js/services/inventory-service.js',
                        '/assets/js/services/directory-service.js',
                        '/assets/js/bower/aws-sdk.min.js', 
                        '/assets/js/modules/common/services/s3-service.js'],
                        serie:true,
                        cache : true
                    });
                }]
            }
        })  
        .state('layout.standard.companyIntro.allProducts',{
            url: '/company/allProducts/:companyName?{companyId}&{supplierId}',
            templateUrl: 'assets/js/modules/company/company-details/products-all.html',
            controller: 'layout.company.controller'
        })  
        .state('layout.standard.companyIntro.allInventory',{
            url: '/company/allInventory/:companyName?{companyId}&{supplierId}',
            templateUrl: 'assets/js/modules/company/company-details/inventories-all.html',
            controller: 'layout.company.controller'
        })
        .state('layout.standard.companyIntro.allRental',{
            url: '/company/allRental/:companyName?{companyId}&{supplierId}',
            templateUrl: 'assets/js/modules/company/company-details/rentals-all.html',
            controller: 'layout.company.controller'
        });;   
        
        $urlRouterProvider
        .when('/companies','companies/list')
        .when('/companies/','companies/list')     
    }]);

})();