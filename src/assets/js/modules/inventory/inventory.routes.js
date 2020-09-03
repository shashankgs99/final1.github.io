(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
       
       layout_state = "layout.standard."
        //2.5 Angular Router
        $stateProvider
            .state(layout_state+'inventory',{
                url: '/inventory',
                abstract: true,
                redirectTo: layout_state+'inventory.summary.category',
                templateUrl: '/assets/js/modules/inventory/main.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(['/assets/js/bower/ng-lodash.min.js',
                        '/assets/js/services/establishment-type-service.js',
                        '/assets/js/services/company-type-service.js',
                        '/assets/js/services/po-service.js',
                        '/assets/js/services/industry-service.js',
                        '/assets/js/services/manufacturer-service.js',
                        ]);
                     }]
                }
            })
            .state(layout_state+'inventory.summary',{
                url: '/summary',
                abstract: true,
                templateUrl: 'assets/js/modules/inventory/states/summary/main.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'assets/js/modules/common/angular-filter.js',
                            '/assets/js/services/city-service.js',
                            '/assets/js/services/category-service.js'
                            ]);
                     }]
                }
            })
            .state(layout_state+'inventory.summary.category',{
                url: '/category?{rental}',
                templateUrl: 'assets/js/modules/inventory/states/summary/states/category/main.html',
                controller: 'inventory.summary.categoryController',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'assets/js/modules/inventory/states/summary/states/category/main.js',
                            '/assets/js/bower/angular-filter.min.js',
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/parent-category-adapter.js',
                            '/assets/js/services/category-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/city-service.js',
                            ]);
                     }]
                }
            }).
            state(layout_state+'inventory.list',{
                url: '/list',
                abstract: true,
                templateUrl: '/assets/js/modules/directory/states/list/directory-list.html',
                controller: 'directory.list.controller',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/modules/directory/states/list/directory-list.css',
                            '/assets/js/modules/directory/states/list/directory-list.js',
                            '/assets/js/services/city-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/services/category-service.js',                        
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/parent-category-adapter.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                        ]);
                    }]
                },
                params: {
                    inventory: true
                }
            }).state(layout_state+'inventory.list.category',{
                url: '/category?{category_name}&{sub_category}',
                views: {
                    filters: {
                        templateUrl: '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.html'
                    },
                    content: {
                        templateUrl: '/assets/js/modules/directory/states/list/views/content/directory-list-content.html',
                        controller: 'directory.list.content.controller'
                    }
                },
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            'assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js',
                            '/assets/js/modules/directory/states/list/views/content/directory-list-content.js',
                            '/assets/js/services/category-service.js',                        
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/parent-category-adapter.js',
                        ]);
                    }]
                }

            }).
            state(layout_state+'inventory.details',{
                url: '/details/:itemId',
                templateUrl: '/assets/js/modules/directory/states/list/directory-details.html',
                controller: 'directoryDetailsController',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            '/assets/js/modules/directory/states/list/directory-details.js'
                        ]);
                    }]
                },
                params: {
                    inventory: true
                }
            })
            .state(layout_state+'inventory.output',{
                url: '/output',
                templateUrl: '/assets/js/modules/inventory/inventory-output/inventory-output.html',
                controller: 'inventoryList.output',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/modules/filters/apply-filters.js',
                            '/assets/js/services/city-service.js',
                            '/assets/js/services/company-service.js',
                            '/assets/js/services/category-service.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/customer-service.js',
                            '/assets/js/services/project-service.js',
                            '/assets/js/services/industry-service.js',
                            '/assets/js/services/manufacturer-service.js',
                            '/assets/js/services/buyer-supplier-service.js'
                        ]);
                    }]
                },
            })
            .state(layout_state+'rental',{
                url: '/rental',
                abstract: true,
                templateUrl: '/assets/js/modules/inventory/main.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(['/assets/js/bower/ng-lodash.min.js', '/assets/js/services/establishment-type-service.js',
                        '/assets/js/services/company-type-service.js','/assets/js/services/po-service.js', 
                        '/assets/js/services/industry-service.js',
                        '/assets/js/services/manufacturer-service.js',
                        ]);
                     }]
                }
            }).state(layout_state+'rental.list',{
                url: '/list',
                abstract: true,
                templateUrl: '/assets/js/modules/directory/states/list/directory-list.html',
                controller: 'directory.list.controller',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/modules/directory/states/list/directory-list.css',
                            '/assets/js/modules/directory/states/list/directory-list.js',
                            '/assets/js/services/city-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/services/category-service.js',                        
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/parent-category-adapter.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                        ]);
                    }]
                },
                params: {
                    inventory: true,
                    rental: true
                }
            }).state(layout_state+'rental.list.category',{
                url: '/category?{category_name}&{sub_category}',
                views: {
                    filters: {
                        templateUrl: '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.html'
                    },
                    content: {
                        templateUrl: '/assets/js/modules/directory/states/list/views/content/directory-list-content.html',
                        controller: 'directory.list.content.controller'
                    }
                },
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            'assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js',
                            '/assets/js/modules/directory/states/list/views/content/directory-list-content.js',
                            '/assets/js/services/category-service.js',                        
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/parent-category-adapter.js',
                        ]);
                    }]
                }

            }).
            state(layout_state+'rental.details',{
                url: '/details/:itemId',
                templateUrl: '/assets/js/modules/directory/states/list/directory-details.html',
                controller: 'directoryDetailsController',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            '/assets/js/modules/directory/states/list/directory-details.js'
                        ]);
                    }]
                },
                params: {
                    inventory: true,
                    rental: true
                }
            })
            .state(layout_state+'rental.output',{
                url: '/output',
                templateUrl: '/assets/js/modules/inventory/inventory-output/inventory-output.html',
                controller: 'inventoryList.output',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/inventory-output/inventory-output.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            '/assets/js/modules/filters/apply-filters.js',
                            '/assets/js/services/city-service.js',
                            '/assets/js/services/company-service.js',
                            '/assets/js/services/category-service.js',
                            '/assets/js/services/user-service.js',
                            '/assets/js/services/parent-category-service.js',
                            '/assets/js/services/customer-service.js',
                            '/assets/js/services/project-service.js',
                            '/assets/js/services/buyer-supplier-service.js'
                        ]);
                    }]
                },
            });
        $urlRouterProvider
            .when('/inventory/','inventory/list/category')
            .when('/inventory','inventory/list/category')
            .when('/rental/','rental/list/category')
            .when('/rental','rental/list/category')
    }]);

})();