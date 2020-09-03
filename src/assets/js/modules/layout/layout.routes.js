(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider',function($stateProvider) {
        $stateProvider
        .state('layout',{
            url: '?{emailVerified}', // No url required
            abstract: true,
            templateUrl: '/assets/js/modules/layout/layout.html',
            controller: 'layout.controller',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/assets/js/bower/ngprogress.min.js',
                        '/assets/js/services/user-service.js',
                        '/assets/js/modules/layout/layout.js',
                        '/assets/js/modules/register/login/login.js',
                        '/assets/js/bower/angular-ui-notification.min.js',
                        '/assets/js/bower/angular-foundation.min.js'
                    ]).then(function(){
                        return $ocLazyLoad.load([
                            '/assets/js/services/directory-service.js'
                        ]);
                    });
                }]
            }
        })
        .state('layout.standard',{
            url: '',
            abstract: true,
            views: {
                header: {
                    templateUrl: '/assets/js/modules/layout/standard/header/header.html',
                    controller: 'layout.header.controller'
                },
                body: {
                    templateUrl: '/assets/js/modules/layout/standard/body/body.html'        
                },
                footer: {
                    templateUrl: '/assets/js/modules/layout/standard/footer/footer.html'
                }
            },
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'https://cdnjs.cloudflare.com/ajax/libs/motion-ui/1.1.1/motion-ui.min.css',
                        '/assets/js/modules/layout/standard/header/header.js',
                        '/assets/js/modules/layout/standard/header/header.css',
                        '/assets/js/bower/angular-foundation.min.js',
                        '/assets/js/services/faq-service.js',
                        '/assets/js/services/company-service.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                        '/assets/js/services/message-service.js',
                        '/assets/js/tinymce/tinymce.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js'
                    ]);
                }]
            }
        })
        ;
    }]);

})();