(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$interpolateProvider','$locationProvider','$httpProvider','$cookiesProvider','$stateProvider','$urlRouterProvider','$qProvider',function($interpolateProvider,$locationProvider,$httpProvider,$cookiesProvider,$stateProvider,$urlRouterProvider,$qProvider) {
        //2.1 interpolater to avoid conflict between handlebar interpolater {{}} to {[{}]}
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
        $qProvider.errorOnUnhandledRejections(false);
        //2.2 enable html5Mode for pushstate ('#'-less URLs)
        $locationProvider.html5Mode(true);

        //2.3 CSRF
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.withCredentials = true;

        //2.4 Authentication Interceptors
        $httpProvider.interceptors.push(['$q', '$location', 'localStorageService','$window',function($q, $location, localStorageService,$window) {
            return {
                'request': function (config) {
                    // intercepting HTTP request when it goes & doing something
                    // console.log(config);
                    
                    config.headers = config.headers || {};
                    if(localStorageService.get('token')) {
                        config.headers.Authorization = 'Token ' + localStorageService.get('token'); //Format needed
                    }
                    return config;
                },
                'responseError': function(response) {
                    // intercepting HTTP response when it comes & doing something
                    if(response.status === 401 || response.status === 403) {
                        console.log(response);
                    }
                    if(response.status === 404) {
                        console.log(response);
                        $location.url('/error');
                        $window.location.reload();
                        return;
                    }
                    return $q.reject(response);
                }
            }
        }]);
    }]);
   
    //3. Run
    app.run(['$rootScope', '$state', '$stateParams',
      function ($rootScope, $state, $stateParams) {
         function handleError(){
             console.log("error");
            $state.go("/assets/js/modules/home/page-not-found.html");
         }
        //UI Router
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);
})();