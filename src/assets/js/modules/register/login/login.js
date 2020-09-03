(function(){
    angular.module('app')
    .controller('login.controller',['$scope','$stateParams','$location','UserService','$ocLazyLoad','Notification','$window','$timeout','$injector','$http','$log','$state','$mdDialog',
     function($scope,$stateParams,$location,UserService,$ocLazyLoad,Notification,$window,$timeout,$injector,$http,$log,$state,$mdDialog){
      // $ocLazyLoad.load('/assets/js/bower/angular-ui-notification.min.js');
      
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      
      if($stateParams.emailVerified){
        Notification.success({
          message:'Email verified. Please login.',
          positionX:'right',
          positionY:'top'
        });
      }
      if($state.current.name.includes("layout.standard.companyIntro.intro")){
        $scope.current_user = {};
      }
      var redirectUrls = ['/admin-dashboard','/supplier-dashboard','/buyer-dashboard','/market-dashboard','/stores-dashboard','/finance-dashboard'];
    
      $scope.selectList = function(type){
          $location.path(type);
      };

      $scope.dashboardsList = function(type){
        if($scope.current_user && Object.keys($scope.current_user.data).length && $scope.current_user.data.id){
          $location.path(type);
        }else{
          $window.open($state.href('login.default'),'_self');
        }
      };

      $scope.login = function(){
        $window.open($state.href('login.default'),'_self');
      };

      $scope.pricing = function(){
        $window.open($state.href('layout.standard.pricing.page'),'_self');
      };

      $scope.register = function(){
        $window.open($state.href('register.options'),'_self');
      };

      // User Authentication
      function getCurrentUser(source){
        $scope.current_user.data = {};
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
          $scope.current_user.data.image_url = $scope.current_user.data.image_url?$scope.current_user.data.image_url:'/assets/img/user-img.png';
          // $scope.current_user.data.avatar = $scope.current_user.data.avatar? $scope.current_user.data.avatar : '/assets/img/user-img.png';
          if($state.current.name.includes("layout.standard.companyIntro.intro")){
               $scope.current_user.data.token = $scope.current_user.token;
               $mdDialog.hide($scope.current_user.data);
          }else{
            if(!data.data.is_email_verified){
              Notification.error({
                message:'Email not verified. Please verfiy email and login.',
                positionX:'right',
                positionY:'top'
              });
              $timeout(function() {
                $scope.current_user.logout('/login');
              }, 3000);            
              return;
            }else{
              if(source === 'login'){
                Notification.success({
                  message:'Successfully LoggedIn',
                  positionX:'right',
                  positionY:'bottom'
                });
                if($stateParams.redirectUrl){
                  window.open($stateParams.redirectUrl,'_self');
                }
              }
            }  
          }        
        }).catch(function(response){
        });
      }
      
      getCurrentUser();

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
      $scope.current_user.login = function(data, valid_data){        
        $scope.current_user.unsuccessful_attempt = false;
        if(valid_data){
          UserService.getToken(data.username, data.password).then(function(response){            
            $scope.current_user.token = response.data.token; // from main controller
            var success = UserService.saveTokenToLocalStorage($scope.current_user.token);
            if(success){
              // $window.location.reload();
              getCurrentUser('login');
            }else{
         
            };
            
          }).catch(function(response){
            $scope.current_user.unsuccessful_attempt = true;
            Notification.error({
              message:'Incorrect username or password, please try again!',
              positionX:'right',
              positionY:'top'
            });
          });
         }else{
          Notification.error({
            message:'Please Enter Username and Password',
            positionX:'right',
            positionY:'top'
          });
        };
      };

      $scope.current_user.updateUserProfile = function (data) {
        console.log(data);
        UserService.update(data.id, data).then(function (data) {
          $scope.success = true;
          console.log('data saved');
          var Notification = $injector.get('Notification');
          Notification.success({
            message: 'Data saved successfully',
            positionX: 'right',
            positionY: 'top'
          });
          $timeout(function () {
            if ($state) {
              getCurrentUser();
              $state.go($state.$current.parent.name + '.view', {
                reload: true
              });
            } else {
              //$location.url('/login');
              //$window.location.reload();
              getCurrentUser();
            }
          }, 3000);
        }, function (err) {
          $scope.error = err.data;
          console.log(err);
        });
      };

      $scope.getAccountSettings = function(){
        if($scope.current_user.data.is_superuser){
          return $state.href('adminDashboard.myAccount.view');
        }else if($scope.current_user.data.is_superuser || $scope.current_user.data.is_seller){
          return $state.href('supplierDashboard.myAccount.view');
        }else if($scope.current_user.data.is_superuser || $scope.current_user.data.is_buyer){
          return $state.href('buyerDashboard.myAccount.view');
        }
      };
      $scope.open = open;

      function open(size, backdrop, itemCount, closeOnClick) {

        var params = {
          templateUrl: 'forgot-password.html',
          resolve: {
          },
          controller: function ($scope, $modalInstance, UserService) {

            $scope.forgotPassword = forgotPassword;

            function forgotPassword(email) {
              if (!email) {
                Notification.error({
                  message: 'Enter Email Address',
                  positionX: 'right',
                  positionY: 'top'
                });
              } else {
                UserService.get({ email: email }).then(function (response) {
                  console.log(response);
                  if (response.data.count > 0) {
                    $http.get('/sendgrid/forgot-password/',
                      {
                        params: {
                          userEmail: email
                        }
                      }).then(function (response) {
                        Notification.success({
                          message: 'Sent email to the Email Address specified',
                          positionX: 'right',
                          positionY: 'top'
                        });
                        $scope.ok();
                      }).catch(function (error) {
                        Notification.error({
                          message: 'Something went wrong. Please try again.',
                          positionX: 'right',
                          positionY: 'top'
                        });
                      });
                  } else {
                    Notification.error({
                      message: 'User with given email doesnt exist',
                      positionX: 'right',
                      positionY: 'top'
                    });
                  }
                });
              }
            }
            $scope.ok = function () {
              $modalInstance.close();
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }
        };

        if (angular.isDefined(closeOnClick)) {
          params.closeOnClick = closeOnClick;
        }

        if (angular.isDefined(size)) {
          params.size = size;
        }
        
        var $modal = $injector.get('$modal');
        var modalInstance = $modal.open(params);

        modalInstance.result.then(function (selectedItem) {
          
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }


      $scope.companySignUp = function (ev, data, $index) {
        $mdDialog.show({
            controller: 'company.login',
            templateUrl: 'assets/js/modules/directory/states/list/views/content/modalpopup/companySignup.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:false,
            locals:{
                $dialogScope:{
                    userInfo : $scope.current_user.data
                }
            }
          }).then(function(res){
            
          });
      }
      
    }]);
})();