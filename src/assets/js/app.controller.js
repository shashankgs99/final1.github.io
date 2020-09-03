(function(){
    angular.module('app')
   .controller('AppGlobalController',[
    '$scope',
    '$http',
    '$timeout',
    '$ocLazyLoad', 
    '$injector',
    '$location',
    '$window',
    '$state',
    '$filter',
    '$log',
    '$stateParams',
    function($scope,$http,$timeout,$ocLazyLoad, $injector,$location,$window,$state, $filter, $log,$stateParams){
        // NgProgressFactory
        $ocLazyLoad.load('/assets/js/bower/ngprogress.min.js').then(function() { // Consider ngProgress module is loaded
            var ngProgressFactory = $injector.get('ngProgressFactory');
            $scope.progressbar = ngProgressFactory.createInstance();
            $scope.progressbar.start();
            $timeout(function() {
               $scope.progressbar.complete();
            }, 3000);
        });
        $scope.$state = $state;

        $ocLazyLoad.load('/assets/js/services/user-service.js').then(function() {
          var UserService = $injector.get('UserService');
          $scope.current_user = {}; // Parent Scope.

          $scope.getAccountHref = function(){
            if($scope.current_user.data.is_superuser){
              $state.go('adminDashboard.myAccount.view');
            }else if($scope.current_user.data.is_superuser || $scope.current_user.data.is_seller){
              $state.go('supplierDashboard.myAccount.view');
            }else if($scope.current_user.data.is_superuser || $scope.current_user.data.is_buyer){
              $state.go('buyerDashboard.myAccount.view');
            }
          };
          // Login & Logout Functionality
          $scope.current_user.logout = function(route){
            UserService.deleteTokenFromLocalStorage();
            UserService.logout().then(function(data){
              if(route){
                $window.location.assign(route);
              }else{
                $window.location.assign('/');
              }
            },function(err){
            })
          };

          $scope.getCompany = function(){
            if($state.current.name.includes("adminDashboard")){
              return;
            }else if($state.current.name.includes("supplierDashboard")){
              $state.go("supplierDashboard.company.view");
            }else{
              if($state.current.name.includes("buyerDashboard")){
                $state.go("buyerDashboard.company.view");
              }
            }
          };  
          
          $scope.getTeam = function(){
            if($state.current.name.includes("adminDashboard")){
              return;
            }else if($state.current.name.includes("supplierDashboard")){
              $state.go("supplierDashboard.team");
            }else if($state.current.name.includes("buyerDashboard")){
                $state.go("buyerDashboard.team");
            }else if($state.current.name.includes("marketDashboard")){
              $state.go("marketDashboard.team");
            }else if($state.current.name.includes("storeDashboard")){
              $state.go("storeDashboard.team");
            }
          };  

          $scope.getMessages = function(){
            if($state.current.name.includes("adminDashboard")){
              return;
            }
            if($state.current.name.includes("supplierDashboard")){
              $state.go("supplierDashboard.Messages");
            }if($state.current.name.includes("buyerDashboard")){
              $state.go("buyerDashboard.Messages");
            }else if($state.current.name.includes("marketDashboard")){
              $state.go("marketDashboard.Messages");
            }else if($state.current.name.includes("storeDashboard")){
              $state.go("storeDashboard.Messages");
            }
          }

          // --- CENTRAL LOGIN SECTION ---
          // Add redirect urls below if a user needs to be redirected . These urls are usually active after login only
          var redirectUrls = ['/admin-dashboard','/supplier-dashboard','/buyer-dashboard','/market-dashboard','/stores-dashboard','/finance-dashboard'];
          // Find current user
          function getCurrentUser(source){
            $scope.current_user.data = {}; // Parent Scope.
            $scope.current_user.token = UserService.getDataFromLocalStorage('token');            
            UserService.getCurrentUser().then(function(data){
              // Assign attributes to scope
              if(!data.data || !data.data.id){
                var redirectUrl = redirectUrls.filter(function(url){ return window.location.pathname.contains(url);});
                if(redirectUrl.length){
                  $window.open($state.href('login.default',{redirectUrl:window.location.pathname}),'_self');
                }
                return;
              }
              $scope.current_user.data = data.data;
              $scope.current_user.data.image_url = $scope.current_user.data.image_url?$scope.current_user.data.image_url:'/assets/img/user-img.png';
              if($scope.current_user.data.dashboards && $scope.current_user.data.dashboards.length){
                $scope.current_user.data.dashboards.map(function(record){
                     if(record.name == 'Supplier'){
                      $scope.current_user.data.is_seller = true;
                     }
                     if(record.name == 'Buyer'){
                      $scope.current_user.data.is_buyer = true;
                     }
                     if(record.name == 'Store'){
                      $scope.current_user.data.is_store = true;
                     }
                     if(record.name == 'Finance'){
                      $scope.current_user.data.is_finance = true;
                     }
                });
              }
              mixpanel.identify($scope.current_user.data.id);
              mixpanel.people.set({
                "$email": $scope.current_user.data.email,
                "$created": $scope.current_user.data.created,
                "organization": $scope.current_user.data.company?$scope.current_user.data.company.company_name:''
              });
              $zopim(function(){
                $zopim.livechat.setName($scope.current_user.data.first_name);
                $zopim.livechat.setEmail($scope.current_user.data.email);
              });
              zE(function() {
                zE.identify({
                  name: $scope.current_user.data.first_name,
                  email: $scope.current_user.data.email,
                  organization: $scope.current_user.data.company?$scope.current_user.data.company.company_name:''
                });
              });
              // console.log($scope.current_user.data);
            }).catch(function(response){
            });
          }
          
          getCurrentUser();
          
        });

     
        
   }]);
})();