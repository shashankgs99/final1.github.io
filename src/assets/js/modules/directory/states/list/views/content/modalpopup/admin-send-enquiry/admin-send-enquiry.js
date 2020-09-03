
(function () {
    var app = angular.module('app');
    app.controller('admin-send-enquiry', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', '$dialogScopeList', '$http', 's3Service', '$stateParams', 'CustomerService', '$timeout','EnquiryHistoryService',
        function ($scope, $window, $mdDialog, $log, $state, Notification, $dialogScopeList, $http, s3Service, $stateParams, CustomerService, $timeout,EnquiryHistoryService) {  
          var total = [];

          $scope.message = $dialogScopeList.message;
          $scope.userInfo = $dialogScopeList.userInfo;

          if($scope.message.enquiry_type && $scope.message.enquiry_type.name){
            $scope.message.enquiry_type = $scope.message.enquiry_type.name;
          }

          $scope.tinymceOptions = {
            plugins: 'link image code media table paste',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
          };

          tinymce.init({
            selector: '#enquiryMessage',
            width: "700",
            height: "700",
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor textcolor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table contextmenu paste code help wordcount'
            ],
            toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_css: [
              '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
              '//www.tinymce.com/css/codepen.min.css'],

          });

          if($scope.message.project){   
              if($scope.message.project.parent_project){
                $scope.message.project_name = $scope.message.project.parent_project.name;
                $scope.message.sub_project = $scope.message.project.name;
              }else{
                $scope.message.project_name = $scope.message.project.name;
              }              
              $scope.message.client = $scope.message.project.customer_client?$scope.message.project.customer_client.name:'NA';
              $scope.message.contractor = $scope.message.project.customer_contractor?$scope.message.project.customer_contractor.name:'NA';              
              $scope.message.project_type = $scope.message.project.project_type?$scope.message.project.project_type.name:'NA';
          }

          $scope.sendEnquiry = function(message){
            message.to = message.to_email;
            var enquiryList = [];
            var emailData = {};
            if(!message.to || !message.to.length){
              Notification.error({
                message: 'Please enter at least one email recipient.',
                positionX: 'right',
                positionY: 'top'
              });
              return;
            }
            var emails = message.to.split(",");
            emailData.subject = message.subject;
            emailData.enquiry_number = $scope.message.enquiry_number;
            emailData.enquiry_type = $scope.message.project_type;
            emailData.showProject = !$scope.message.hideProject;
            emailData.buyer_message = message.messages_text;
            emailData.viewEnquiry = message.id;
            emailData.message = $scope.message.message;
            if($scope.userInfo){
              emailData.senderName = $scope.userInfo.first_name+' '+($scope.userInfo.last_name?$scope.userInfo.last_name:'');            
              emailData.senderEmail = $scope.userInfo.email;
            }
            if($scope.message.project.parent_project){
              emailData.project = {name: $scope.message.project.parent_project.name,contract_number:$scope.message.project.parent_project.contract_number};
              emailData.sub_project = {name: $scope.message.project.name,contract_number:$scope.message.project.contract_number};
            }else{
              emailData.project = {name: $scope.message.project.name,contract_number:$scope.message.project.contract_number};
            }
            
            if($scope.message.project.client_customer){
              emailData.client = $scope.message.project.client_customer.name;
            }
            if($scope.message.project.contractor_customer){
              emailData.contractor = $scope.message.project.contractor_customer.name;
            }
            if($scope.message.attachments && $scope.message.attachments.length){
              emailData.attachments = $scope.message.attachments.map(function(atch){
                var file = {};
                file.s3_url = atch;
                file.filename = atch.split('/').pop();
                return file;
              });
            }

            emails.forEach(function (item) {
              var data = {};
              data.message = message.messages_text;              
              data.receiver_email = item;
              data.status = message.enquiry_state;
              data.enquiry = message.id;              
              enquiryList.push(data);
            });
            $http.get('/sendgrid/admin-send-enquiry/',
            {
              params: {
                supplierEmail: emails,
                emailBody: emailData
              }
            }).then(function (response) {
              Notification.success({
                message: 'Sent email to the Email Address specified',
                positionX: 'right',
                positionY: 'top'
              });
              EnquiryHistoryService.post(enquiryList).then(function (res) {
                $mdDialog.hide();
              });
            }).catch(function (error) {
              Notification.error({
                message: 'Something went wrong. Please try again.',
                positionX: 'right',
                positionY: 'top'
              });
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
                    emails:data
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