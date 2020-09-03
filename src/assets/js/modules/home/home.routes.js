(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
        $stateProvider
        .state('layout.standard.home',{
            url: '/',
            abstract: true,
            templateUrl: '/assets/js/modules/home/home.html'
        })
        .state('layout.standard.home.views',{
            url: '',
            views: {
                navigation: {
                    templateUrl: '/assets/js/modules/home/views/navigation/navigation.html',
                    controller: 'home.navigation.controller'
                },
                default: {
                    templateUrl: '/assets/js/modules/home/views/default/main.html',
                    controller:'home.default'        
                },
                newsletter: {
                    templateUrl: '/assets/js/modules/home/views/newsletter/main.html',
                    controller: 'home.newsletterController'
                }
            },
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        // '/assets/js/modules/home/blog-details.js',
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/modules/blog/create-blog/create-blog.js',
                        'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css',
                        '/assets/js/modules/home/views/navigation/navigation.js',
                        '/assets/js/services/supplier-service.js',
                        '/assets/js/services/parent-category-service.js',
                        '/assets/js/modules/home/views/default/main.js',
                        '/assets/js/services/directory-service.js',
                        '/assets/js/modules/home/views/navigation/navigation.css',
                        '/assets/js/modules/home/views/newsletter/main.js',
                        '/assets/js/modules/home/views/navigation/angucomplete-alt.js', // Changed limit of search to 5
                        '/assets/js/modules/home/views/navigation/angucomplete.css',
                        '/assets/js/services/category-service.js',
                        '/assets/js/services/inventory-service.js',
                        '/assets/js/modules/common/services/s3-service.js',
                        '/assets/js/modules/common/services/common-services.js',
                        '/assets/js/bower/aws-sdk.min.js',
                        '/assets/js/services/user-service.js',
                        '/assets/js/modules/common/services/common-services.js',
                        '/assets/js/modules/directory/states/list/views/content/directory-list-content.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js'
                    ]);
                }]
            }
        })
        .state('layout.standard.aboutus',{
            url: '/about-us',
            abstract: true,
            
        })
        .state('layout.standard.aboutus.about',{
            url: '',
            templateUrl: '/assets/js/modules/home/about-us.html'
        })
        .state('layout.standard.howitworks',{
            url: '/how-it-works',
            abstract: true,            
        })
        .state('layout.standard.howitworks.how',{
            url: '',    
            templateUrl: '/assets/js/modules/home/how-it-works.html',
        })
        
        .state('layout.standard.faq',{
            url: '/frequently-asked-questions',
            abstract: true,            
        })
        .state('layout.standard.faq.questions',{
            url: '',
            templateUrl: '/assets/js/modules/home/frequently-asked-questions.html',
            controller:'layout.header.controller',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/bower/angular-filter.min.js'
                    ]);
                }]
            }
        })
        .state('layout.standard.contactus',{
            url: '/contact',
            abstract: true,            
            controller: 'home.contactUsController',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/modules/home/views/newsletter/main.js',
                    ]);
                }]
            }
        })
        .state('layout.standard.contactus.contact',{
            url: '',
            templateUrl: '/assets/js/modules/home/contact.html'
        })
        .state('layout.standard.tnc',{
            url: '/terms-and-conditions',
            abstract: true,            
        })
        .state('layout.standard.tnc.terms',{
            url: '',
            templateUrl: '/assets/js/modules/home/terms-and-conditions.html'
        })
        .state('layout.standard.privacypolicy',{
            url: '/privacy-policy',
            abstract: true,            
        })
        .state('layout.standard.privacypolicy.privacy',{
            url: '',
            templateUrl: '/assets/js/modules/home/privacy-policy.html'
        })  
        .state('layout.standard.cookie-policy',{
            url: '/cookie-policy',
            abstract: true,            
        })   
        .state('layout.standard.cookie-policy.cookies',{
            url: '',
            templateUrl: '/assets/js/modules/home/cookie-policy.html'
        })
        .state('layout.standard.help',{
            url: '/help',
            abstract: true,            
        })
        .state('layout.standard.help.pages',{
            url: '',
            templateUrl: '/assets/js/modules/home/help.html',
            controller:'layout.header.controller'
        })
        .state('layout.standard.help.stroes',{
            url: '/stores-dashboard/{type}',
            templateUrl: '/assets/js/modules/home/stores-help.html',
            controller:'layout.stores.help'
        })
        .state('layout.standard.investor',{
            url: '/investor-pitch',
            abstract: true,            
        })
        .state('layout.standard.investor.page',{
            url: '',
            templateUrl: 'assets/js/modules/home/investor-pitch.html',
        })
        .state('layout.standard.error',{
            url: '/error',
            abstract: true,            
        })   
        .state('layout.standard.error.page',{
            url: '',
            templateUrl:'assets/js/modules/home/page-not-found.html',
        })
        .state('layout.standard.press',{
            url: '/press',
            abstract: true,            
        })   
        .state('layout.standard.press.links',{
            url: '',
            templateUrl:'assets/js/modules/home/press.html',
        })
        .state('layout.standard.pricing',{
            url: '/pricing',
            abstract: true,            
        })   
        .state('layout.standard.pricing.page',{
            url: '',
            templateUrl:'assets/js/modules/home/pricing.html',
        })
        .state('layout.standard.blog',{
            url: '/blog',
            abstract: true,     
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'assets/js/modules/home/blog-details.js',
                        '/assets/js/services/blog-service.js',
                        '/assets/js/modules/common/services/s3-service.js',
                        '/assets/js/bower/aws-sdk.min.js',
                        '/assets/js/modules/blog/view-blog/view-blog.js',
                    ]);
                }]
            }       
        })   
        .state('layout.standard.blog.page',{
            url: '',
            templateUrl:'/assets/js/modules/home/blog-details.html',
            controller:'blogDetailsController'
        })
        .state('layout.standard.blog.view',{
            url: '/view/{blogId}/:title',
            templateUrl:'assets/js/modules/blog/view-blog/view-blog.html',
            controller:'layout.standard.ViewblogController'
        });
    }]);

})();