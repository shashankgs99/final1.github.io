
(function () {
    var app = angular.module('app');
    app.controller('admin-send-offer', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'OfferService', '$http', '$mdDialog', '$stateParams', 'CustomerService', '$dialogScope','EnquiryHistoryService','ProjectService',
        function ($scope, $window, $modal, $log, $state, Notification, OfferService, $http, $mdDialog, $stateParams, CustomerService, $dialogScope,EnquiryHistoryService,ProjectService) {  
         $scope.offer = $dialogScope.offer;
         $scope.userInfo = $dialogScope.userInfo;
          var total =[];
          if ($scope.offer && $scope.offer.enquiry) {
              if ($scope.offer.enquiry.project) {
                if ($scope.offer.enquiry.project.parent_project) {
                  $scope.offer.parent_project = $scope.offer.enquiry.project.parent_project.name;
                  $scope.offer.sub_project = $scope.offer.enquiry.project.name;
                } else {
                  $scope.offer.parent_project = $scope.offer.enquiry.project.name;
                }
                if ($scope.offer.enquiry.project) {
                  $scope.offer.customer = $scope.offer.enquiry.project.customer.name;
                }
                if ($scope.offer.enquiry.project.project_type) {
                  $scope.offer.project_type = $scope.offer.enquiry.project.project_type.name;
                }
              }
            if ($scope.offer.enquiry.sender) {
              $scope.offer.to = $scope.offer.enquiry.sender.email;
            }
            if ($scope.offer.enquiry) {
              $scope.offer.enquiry_number = $scope.offer.enquiry.enquiry_number;
            }
        }else{
          if($scope.offer && $scope.offer.project && Object.keys($scope.offer.project).length){
             if($scope.offer.project.project_type){
               $scope.offer.project_type=$scope.offer.project.project_type.name;
             }
             if($scope.offer.project.created_date){
              $scope.offer.created_date = $scope.offer.project.created_date;
            }
             if($scope.offer.project.internal_reference_number){
               $scope.offer.enquiry_number = $scope.offer.project.internal_reference_number;
             }
             $scope.offer.subject =  `offer for enquiry ${$scope.offer.project.internal_reference_number ?  $scope.offer.project.internal_reference_number.toString() : ''}`;
          }
       }

        if($scope.offer && $scope.offer.project && !(Object.keys($scope.offer.project).length)){
            ProjectService.getOne($scope.offer.project).then(function(res){
               if(res.data){
                  var result = res.data; 
                  $scope.offer.project = result;
                  if(result.project_type){
                    $scope.offer.project_type = result.project_type.name;
                  }
                  if(result.created_date) {
                    $scope.offer.created_date = result.created_date;
                  }
                  if(result.internal_reference_number){
                    $scope.offer.enquiry_number = result.internal_reference_number;
                  }
                  $scope.offer.subject =  `offer for enquiry ${result.internal_reference_number ? result.internal_reference_number.toString() : ''}`;
               }
            });
        }

        // function getUserData(){
        //     if($scope.current_user){
        //         return $scope.current_user.data;
        //     }
        // }
        
          $scope.sendOffer = function(offer){
           
            var emailData = {};
            if(!offer.to || !offer.to.length){
              Notification.error({
                message: 'Please enter at least one email recipient.',
                positionX: 'right',
                positionY: 'top'
              });
              return;
            }
            var emails = offer.to.split(",");
            emailData.enquiry_number = offer.enquiry_number;
            emailData.enquiry_type = offer.project_type;
            emailData.enquity_created = offer.created;
            emailData.offer_number = offer.offer_number;
            emailData.created_date = offer.created_date;
            emailData.validty = offer.expiry_date;
            // emailData.signature = $scope.userInfo.signature;
            //  $scope.userInfo.signature ? emailData.signature = $scope.userInfo.signature: emailData.signature = "Supplierscave team";
             if( $scope.userInfo.signature){
              emailData.signature = $scope.userInfo.signature;
             }else{
              emailData.sender_name = $scope.userInfo.first_name + " "+$scope.userInfo.last_name;
             }
            if(offer.attachments && offer.attachments.length){
              emailData.attachments = offer.attachments.map(function(atch){
                var file = {};
                file.s3_url = atch;
                file.filename = atch.split('/').pop();
                return file;
              });
            }
            emailData.supplier_message = offer.messages_text;
            emailData.message = offer.message;
            if(offer.enquiry){
              emailData.subject = offer.enquiry.subject;
            }
            if(offer.project){
              emailData.subject = offer.subject;
              emailData.message = offer.description;
            }

            $http.get('/sendgrid/admin-send-offer/',
            {
              params: {
                to: emails,
                emailBody: emailData
              }
            }).then(function (response) {
              Notification.success({
                message: 'Sent email to the Email Address specified',
                positionX: 'right',
                positionY: 'top'
              });
              var updateOffer={offer_state:'Offer Sent'};
              updateOffer.edit_notes = offer.messages_text;
              OfferService.update(offer.id,updateOffer).then(function(response){
                $mdDialog.cancel();
              });
            }).catch(function (error) {
              Notification.error({
                message: 'Something went wrong. Please try again.',
                positionX: 'right',
                positionY: 'top'
              });
              $mdDialog.cancel();
            });
          };

          $scope.checkEmail = function(data,ev){
            var error = false;
            var emails =[];
            total = [];
            var unsaved = [];
            if(data && data.includes(",")){
              emails = data.split(",");
            }else{
              emails.push(data);
            }
          emails.map(function (item) {
            if (item) {
              if (error) {
                return;
              }
              var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              var checkEmail = re.test(String(item).toLowerCase());
              if (!checkEmail) {
                Notification.error({
                  message: `Please enter valid email:${item}`,
                  positionX: 'right',
                  positionY: 'top'
                });
                error = true;
                return;
              }
              CustomerService.get({ email: item }).then(function (res) {
                if (!res.data.results.length) {
                  total.push({unsaved:res.config.params.email});
                  unsaved.push({email:res.config.params.email,disabled:true});
                  if (total.length == emails.length) {
                    saveEmail(unsaved,ev)
                  }
                } else {
                  total.push({saved:res.config.params.email});
                  if (total.length == emails.length) {
                    saveEmail(unsaved,ev)
                  }
                }
              });
            }
          });
        };
      
        function saveEmail(data,ev){
          if(data.length){
            return $mdDialog.show({
              controller: 'saveCustomerEmailController',
              templateUrl: 'assets/js/modules/directory/states/list/views/content/modalpopup/save-emails.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              multiple: true,
              clickOutsideToClose: true,
              locals: {
                $dialogScope: {
                  emails:data,
                  offer:true
                }
              }
            }).then(function(res){
               if(res.length){
                 var list =[];
                 total.map(function(item){
                    if('saved' in item){
                      list.push(item.saved);
                    }
                 });
                 res.map(function(item){
                   list.push(item.emailid1);
                 });
                 list = list.toString();
                 $scope.message.to_email = list;
               }
            });
          }
        }
        
        $scope.cancel = function(){
          $mdDialog.cancel();
        };
        
        }]);
})();