// (function(){
//     var app = angular.module('app');
    
//     //2. Update configuration
//     app.config(['$stateProvider',function($stateProvider) {
       
//         //2.5 Angular Router
//         $stateProvider
//         .state('directory',{
//             url: '/directory',
//             abstract: true,
//             templateUrl: '/assets/partials/directory/master.html',
//             controller: 'directory.progressController',
//             resolve: { 
//                 loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
//                     return $ocLazyLoad.load([
//                         '/assets/js/controllers/directory.js',
//                         '/assets/js/services/parent-category-service.js',
//                         '/assets/js/services/category-service.js',
//                         '/assets/js/services/directory-service.js',
//                         '/assets/js/handsontable/ngHandsontable.js',
//                         '/assets/js/services/miscellaneous.js',
//                         '/assets/js/services/handsontable-adapter.js',
//                         '/assets/js/directives/handsontable/handsontable-addons.js',
//                         '/assets/js/directives/handsontable/handsontable-automate2.js',
//                         '/assets/js/directives/handsontable/handsontable-core.js',
//                         '/assets/js/directives/dropdown/dropdown.js',
//                         '/assets/js/bower/angular-filter.min.js'
//                     ]);
//                 }]
//             }
//         })
//         .state('directory.selectChannels',{
//             url: '/select-channels',
//             templateUrl: '/assets/partials/directory/select-channels.html',
//             controller: 'directory.progress.selectChannelsController'
//         });
//     }]);

// })();

(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
        //2.5 Angular Router
        var layout_state = 'layout.standard.'
        $stateProvider
        .state(layout_state+'directory',{
            url: '/directory',
            abstract: true,
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/modules/directory/directory.js',
                        '/assets/js/services/company-service.js',
                        '/assets/js/services/parent-category-service.js',
                        '/assets/js/services/parent-category-adapter.js',
                        '/assets/js/services/category-service.js',
                        '/assets/js/services/directory-service.js',
                        '/assets/js/services/inventory-service.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                        '/assets/js/services/enquiry-history-service.js',
                        '/assets/js/services/supplier-service.js',
                        '/assets/js/services/city-service.js',
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/modules/common/services/s3-service.js',
                    ]);
                }]
            }
        })
        // List of Suppliers
        .state(layout_state+'directory.list',{
            url: '/list',
            abstract: true,
            templateUrl: '/assets/js/modules/directory/states/list/directory-list.html',
            controller: 'directory.list.controller',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/services/establishment-type-service.js',
                        '/assets/js/services/company-type-service.js',
                        '/assets/js/services/po-service.js',
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                        '/assets/js/services/enquiry-history-service.js',
                        '/assets/js/modules/directory/states/list/directory-list.css',
                        '/assets/js/modules/directory/states/list/directory-list.js'
                    ]);
                }]
            }
        })
        .state(layout_state+'directory.list.views',{
            url: '?category&city&country&state',
            views: {
                filters: {
                    templateUrl: '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.html',
                },
                content: {
                    templateUrl: '/assets/js/modules/directory/states/list/views/content/directory-list-content.html',
                    controller: 'directory.list.content.controller'
                }
            },
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/services/supplier-service.js',
                        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                        '/assets/js/tinymce/tinymce.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                        '/assets/js/services/message-service.js',
                        '/assets/js/directives/file-upload.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                        '/assets/js/bower/aws-sdk.min.js',
                        '/assets/js/services/enquiry-history-service.js',
                        '/assets/js/modules/common/services/s3-service.js',
                        '/assets/js/modules/common/services/common-services.js',
                        '/assets/js/bower/ng-lodash.min.js',
                        'assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js',
                        '/assets/js/modules/directory/states/list/views/content/directory-list-content.js'
                    ]);
                }]
            }
        }).state(layout_state+'directory.selectChannels',{
            url: '/select-channels',
            templateUrl: '/assets/partials/directory/select-channels.html',
            controller: 'directory.progress.selectChannelsController',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/bower/angular-filter.min.js'
                    ]);
                }]
            }
        }).
        state(layout_state+'directory.details',{
            url: '/details/:itemId',
            templateUrl: '/assets/js/modules/directory/states/list/directory-details.html',
            controller: 'directoryDetailsController',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                        '/assets/js/directives/dropdown/dropdown.js',
                        '/assets/js/services/supplier-service.js',
                        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                        '/assets/js/tinymce/tinymce.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                        '/assets/js/services/message-service.js',
                        '/assets/js/directives/file-upload.js',
                        '/assets/js/bower/aws-sdk.min.js',
                        '/assets/js/services/enquiry-history-service.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                        '/assets/js/modules/common/services/s3-service.js',
                        '/assets/js/modules/common/services/common-services.js',
                        '/assets/js/bower/ng-lodash.min.js',
                        '/assets/js/modules/directory/states/list/directory-details.js',
                        '/assets/js/modules/directory/states/list/views/content/modalpopup/view-product-details.js'
                    ]);
                }]
            }
        });

        // Handling default routing
        $urlRouterProvider
            .when('/directory','directory/list')
            .when('/directory/','directory/list')
    }]);

})();