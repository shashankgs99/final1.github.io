(function(){
    angular.module('app')
    .controller('home.newsletterController',['$scope','$interval','$ocLazyLoad', '$injector','$cookies','UserService',
    function($scope,$interval,$ocLazyLoad, $injector,$cookies,UserService){
      console.log("loaded");
      $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
      $scope.newsletter = {};
      $scope.newsletter.success = false;
      $scope.newsletter.error = false;
      $scope.cookieData = true;
      $scope.submit = function(valid){
        if(valid){
          var data = JSON.stringify(
              {
                email_id : $scope.newsletter.emailid
              }
          );
          $ocLazyLoad.load('/assets/js/services/newsletter-service.js').then(function() {
            var NewsletterService = $injector.get('NewsletterService');
            NewsletterService.post(data).then(function(data){
              $scope.newsletter.success = true;
              console.log("success");
              console.log(data);
            },
              function(err){
                $scope.newsletter.error = true;
                $scope.newsletter.errorMessage = err.data.email_id;
                console.log($scope.newsletter.errorMessage);
                console.log(err.data);
                console.log(err);
              }
            );

          });
          
        }
      }
           
      var user = $cookies.get('Cookie');
      if(user){
        $scope.cookieData =false;
      }else{
        $scope.cookieData =true;
      }

      console.log($cookies.get('Cookie'));

      $scope.Cancel = function( ){
        $scope.cookieData =false;
        var today = new Date();
        var expireValue = new Date(today);
        expireValue.setMonth(today.getMonth( )+2);
        $cookies.put('Cookie','Scookie', {'expires': expireValue});
      }
      $scope.Accept = function( ){
       // For Accept Function
      }
    
    }])
    .controller('home.contactUsController',['$scope','$injector','Notification','$http',function($scope,$injector,Notification,$http){
      $scope.user = {};
      $scope.message = '';
      
      $scope.submitMessage = function(user,message){
        if($scope.current_user.data && $scope.current_user.data.first_name){
          user.name = $scope.current_user.data.first_name + ' ' + $scope.current_user.data.last_name;
          user.emailId = $scope.current_user.data.email;
          user.contactNo = $scope.current_user.data.contact_no;
        }else{
          if(!user.name || !user.emailId || !user.contactNo){
            Notification.error({
              message: 'Please fill all the details',
              positionX: 'right',
              positionY: 'top'
            });
            return;
          }
        }
        $http.get('/sendgrid/send-support-email/',
        {
          params: {
            userName: user.name,
            userEmailId: user.emailId,
            userContactNo: user.contactNo,
            message: message
          }
        }).then(function (response) {
          Notification.success({
            message: 'Sent email to the support team. Will get back shortly!',
            positionX: 'right',
            positionY: 'top'
          });
          $scope.user = {};
          $scope.message = '';
          message = '';
        });
      };
    }]);
})();