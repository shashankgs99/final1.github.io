(function () {
    var app = angular.module('app');
    app.controller('projectController', ['$scope', '$window', '$modal', '$timeout','$state','ProjectService','dateService','Notification','IndustryService','CustomerService','$log','$rootScope','$stateParams','$mdDialog','$dialogScope',
    function ($scope, $window, $modal, $timeout,  $state,ProjectService,dateService,Notification,IndustryService,CustomerService,$log,$rootScope,$stateParams,$mdDialog,$dialogScope) {
     
        $scope.disableProject =  $dialogScope.disable;
        $scope.selectedIndustry = [];
        $scope.project = {due_date: new Date()};
        $scope.clientcontacts = [];
        $scope.contractorContacts = [];
        $scope.selectedContacts = [];
        $scope.clients = [];
        $scope.contractors=[];
        $scope.hide = true;

        $scope.title = $dialogScope.title;
  
        if($stateParams.projectId){
           $scope.name = "Edit";
        }else{
           $scope.name = "Add";
        }
  
        ProjectService.getMainProjects().then(function (data) {
          $scope.projectsData = data.data;
          if ($dialogScope.parentProject) {
            $scope.project.parent_project = $dialogScope.parentProject;
          }
        });
  
        ProjectService.getProjectTypes().then(function(data){
            projectTypes = data.data.results;
        });
      
        CustomerService.get({page_size:10000}).then(function (data) {
          $scope.customers = data.data.results;
            var customers = data.data.results;
            customers.forEach(function(item){
                if(item.role_type.length){
                    if (item.role_type[0] == 1){
                       $scope.contractors.push(item);
                    }else{
                        if (item.role_type[0] == 9){
                          $scope.clients.push(item);
                        }
                    }
                }
            });
        });
        
        IndustryService.get().then(function(data){
            $scope.industries = data.data.results;
            $scope.industries = $scope.industries.map(function(item){return {id:item.id,label:item.industry};});
        });
  
      function getUserInfo() {
         if($dialogScope.userInfo){
           return $dialogScope.userInfo;
         }
           if($scope.current_user){
            return $scope.current_user.data;
           }  
      }
  
      function getCustomerData(info,type) {
        // if($state.current.name.includes("adminDashboard")){
        //   CustomerService.get().then(function (data) {
        //     $scope.customers = data.data.results;
        //   });
        //   if(type === "client"){
        //     if($scope.project){
        //       $scope.project.customer_client = info.id;
        //       $scope.selectContacts({ customer_client: $scope.project.customer_client });
        //     }else{
        //       $scope.project = {customer_client:info.id};
        //       $scope.selectContacts({ customer_client: $scope.project.customer_client });
        //     }
        //   }else{
        //     if($scope.project){
        //       $scope.project.customer_contractor = info.id;
        //       $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
        //     }else{
        //       $scope.project = {customer_contractor:info.id};
        //       $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
        //     }
        //   }
        // }else{
          var userInfo = getUserInfo();
          var ownerId = userInfo.id;
          CustomerService.get({page_size:10000}).then(function (data) {
            $scope.customers = data.data.results;
            var customers = data.data.results;
            customers.forEach(function(item){
                if(item.role_type.length){
                    if (item.role_type[0] == 1){
                       $scope.contractors.push(item);
                    }else{
                        if (item.role_type[0] == 9){
                          $scope.clients.push(item);
                        }
                    }
                }
            });
            if(type === "client"){
              if($scope.project){
                $scope.project.customer = info.id;
                $scope.selectContacts({ customer: $scope.project.customer });
              }else{
                $scope.project = {customer:info.id};
                $scope.selectContacts({ customer: $scope.project.customer });
              }
            }else{
              if($scope.project){
                $scope.project.customer_contractor = info.id;
                $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
              }else{
                $scope.project = {customer_contractor:info.id};
                $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
              }
            }
        });
          // CustomerService.get({ownerId:ownerId}).then(function (data) {
          //   $scope.customers = data.data.results;
          //   if(type === "client"){
          //     if($scope.project){
          //       $scope.project.customer_client = info.id;
          //       $scope.selectContacts({ customer_client: $scope.project.customer_client });
          //     }else{
          //       $scope.project = {customer_client:info.id};
          //       $scope.selectContacts({ customer_client: $scope.project.customer_client });
          //     }
          //   }else{
          //     if($scope.project){
          //       $scope.project.customer_contractor = info.id;
          //       $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
          //     }else{
          //       $scope.project = {customer_contractor:info.id};
          //       $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
          //     }
          //   }
          // });
        
      
         
      }
  
      var projectTypes;
      if ($stateParams.projectId) {
        ProjectService.getOne($stateParams.projectId).then(function (data) {
          $scope.project = data.data;
          if ($scope.project.due_date) {
            $scope.project.due_date = dateService.convertDateToJS($scope.project.due_date);
          }
          if ($scope.project.industries) {
            $scope.project.industries.forEach(function (item) {
              $scope.selectedIndustry.push({ id: item.id });
            });
          }
          if ($scope.project.customer_client) {
            $scope.project.customer_client = $scope.project.customer_client.id;
            $scope.selectContacts({ customer_client: $scope.project.customer_client });
          }
          if ($scope.project.customer_contractor) {
            $scope.project.customer_contractor = $scope.project.customer_contractor.id;
            $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
  
          }
          if ($scope.project.client_contacts.length) {
            $scope.clientcontacts = [];
            $scope.project.client_contacts.map(function (item) {
              $scope.clientcontacts.push({ id: item.id })
            });
          }
          if ($scope.project.contractor_contacts.length) {
            $scope.selectedContacts = [];
            $scope.project.contractor_contacts.map(function (item) {
              $scope.selectedContacts.push({ id: item.id })
            });
          }
          if ($scope.project.project_type) {
            if ($scope.project.project_type.id == 1) {
              $scope.project.project_type = "Budgetary";
            } else {
              $scope.project.project_type = "Firm";
            }
          }
        });
      }
        
      $scope.createClient = createClient;
  
      function createClient(ev,type){
          
          $mdDialog.show({
            controller: 'layout.standard.createCustomer',
            templateUrl: 'assets/js/modules/customer/customer-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            multiple: true,
            clickOutsideToClose: true,
            locals: {
              $dialogScope: {
                userInfo: getUserInfo(),
                type: type
              }  
            }
          }).then(function (res) {
                if(res){
                  getCustomerData(res,type);
                }
            }, function () {
          });
  
      }
  
      // function createClient(size, backdrop, itemCount, closeOnClick) {
      //   var template;
        
      //   var params = {
      //     templateUrl: "customer.html",
      //     resolve: {
      //     },
      //     controller: function ($scope, $modalInstance, UserService) {
      //       $scope.current_user = {};
      //       $scope.title = backdrop;
      //       $scope.current_user.data = getUserInfo(); 
      //       $scope.userInfo = getUserInfo();
      //       $scope.$on("customerClose",function(event,data){
      //           $modalInstance.dismiss('cancel');
      //           if(data){
      //             getCustomerData(data,backdrop);
      //           }
      //       });
            
      //       $scope.ok = function () {
      //         $modalInstance.close();
      //       };
  
      //       $scope.cancel = function () {
      //         $modalInstance.dismiss('cancel');
      //       };
      //     }
      //   };
  
      //   if (angular.isDefined(closeOnClick)) {
      //     params.closeOnClick = closeOnClick;
      //   }
  
      //   if (angular.isDefined(size)) {
      //     params.size = size;
      //   }
        
      //   var modalInstance = $modal.open(params);
  
      //   modalInstance.result.then(function (selectedItem) {
          
      //   }, function () {
      //     $log.info('Modal dismissed at: ' + new Date());
      //   });
      // }
       
      $scope.dropDownSettings = {
        smartButtonMaxItems: 3,
        smartButtonTextConverter: function (itemText, originalItem) {
          return itemText;
        },
      };
              
      $scope.cancelProjectInternal = function(){
         $mdDialog.hide();
      };
  
      $scope.selectContacts = function(data){
        $scope.clientContacts = [];
        CustomerService.getOne(data.customer).then(function (data) {
          var result = data.data;
          if (result.contacts) {
            result.contacts.map(function (item) {
              var name;
              if(item.firstname){
                name = item.firstname; 
                if(item.lastname){
                  name += " " + item.lastname;
                }
              }else{
                if(item.lastname){
                  name = item.lastname;
                }
              }
              name ? $scope.clientContacts.push({id:item.id,label:name}) : '';
            });
          }
        });
      }
  
      $scope.contractor = function(data){
        $scope.contractorContacts = [];
        CustomerService.getOne(data.customer_contractor).then(function (data) {
          var result = data.data;
          if (result.contacts) {
            result.contacts.map(function (item) {
              var name;
              item.firstname ? name = item.firstname : '';
              item.lastname ? name += " " + item.lastname : '';
              name ? $scope.contractorContacts.push({id:item.id,label:name}) : '';
            });
          }
        });
      }
  
      $scope.saveProject = function(project,valid){
        $scope.submitted = true;
        if(!project.name){
          Notification.error({
            message: 'please enter project name',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if ($scope.clientcontacts.length) {
          var contacts = $scope.clientcontacts.map(function (item) {
            return item['id'];
          });
          project.customer_contacts = contacts;
        }
        if ($scope.contractorContacts.length) {
          var contacts = $scope.contractorContacts.map(function (item) {
            return item['id'];
          });
          project.contractor_contacts = contacts;
        }
        if($scope.selectedIndustry.length){
          project.industries = $scope.selectedIndustry.map(function(item){ return item.id;});                
        }
        if(project.project_type){
          var types =  projectTypes.filter(function(item){ return item.name === project.project_type;})
          if(types && types.length){
              project.project_type = types[0].id;
          }
        }
        if(angular.isDate(project.due_date)){
          project.due_date = dateService.convertDateToPython(project.due_date);
        }
        if(project.parent_project){
          project.parent_project = project.parent_project.id;
        }
         
          ProjectService.post(project).then(function(data){
              console.log("success");
              Notification.success({
                  message: 'Successfully added Project',
                  positionX: 'right',
                  positionY: 'top'
                });
           $mdDialog.hide(data.data);     
          },function(err){
              $scope.error = err.data;
              console.log($scope.error);
          });
       
           
      };
    }]);
  })();