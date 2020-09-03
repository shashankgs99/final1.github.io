(function () {
    var app = angular.module('app');
    app.controller('customerCompanyController', ['$scope', '$window', '$modal', '$log','$state','Notification','CustomerService','$stateParams','BankService','TaxService',
    function ($scope, $window, $modal, $log,  $state,Notification,CustomerService,$stateParams,BankService,TaxService) {
        
        $scope.hide = false;
        $scope.supplierDetails = false;
        $scope.customerDetails = false;
        $scope.taxData =[];
        $scope.bankData = [];
        $scope.taxTypeList =[];
        if($state.current.name.includes("buyerDashboard.suppliers.viewCompany")){
           $scope.hide = true;
           $scope.type="Supplier";
        }else{
            $scope.type="Customer"; 
        }

        if($state.current.name.includes("buyerDashboard.suppliers.viewCompany")){
            $scope.customerDetails = true;
         }

         if($state.current.name.includes("supplierDashboard.customers.viewCompany")){
            $scope.supplierDetails = true;
         }

        $scope.viewOffer = function (data) {
            var emails = [];
            var supplier = [];
            if (data) {
                if (data.contacts.length) {
                    var contactsInfo = data.contacts;
                    contactsInfo.map(function (item) {
                        if (item.emailid1) {
                            emails.push(item.emailid1);
                            supplier.push({ id: data.id, name: data.name });
                        }
                        if (item.emailid2) {
                            emails.push(item.emailid2);
                            supplier.push({ id: data.id, name: data.name });
                        }
                    });
                }
            }
            supplier = _.uniqBy(supplier, 'id');
            emails = _.uniq(emails);
            $state.go("buyerDashboard.offers.List", { emails: emails, supplier: supplier[0] });
        };

        $scope.viewContacts = function(info){
            var data = [];
            data.push(info);
            if ($state.current.name.includes("supplierDashboard")) {
                $state.go("supplierDashboard.customers.viewContacts",{data: data, companyId: data[0].id});
            } else {
                $state.go("buyerDashboard.suppliers.viewContacts",{data: data, companyId: data[0].id});
            }
           
        }


        $scope.viewProjectsDetails = function (res) {
            var data = [];
            data.push(res);
            if (data) {
                var type = data[0].role_type;
                if ($state.current.name.includes("adminDashboard")) {
                    $state.go("adminDashboard.projects.list", { customer: data[0] });
                } else {
                    $state.go("supplierDashboard.projects.list", { customer: data[0] });
                }
            }

        };


        if($stateParams.companyId){
             BankService.get({ customer: $stateParams.companyId }).then(function (result) {
                if (result.data.results.length) {
                  $scope.bankData = result.data.results;
                }
              });
              TaxService.get({ customer: $stateParams.companyId }).then(function (res) {
                $scope.taxData = res.data.results;
                $scope.taxData = $scope.taxData.map(function (item) {
                  if (item.tax_type) {
                    if ($scope.taxTypeList.length) {
                      $scope.taxTypeList.map(function (tax) {
                        if (item.tax_type === tax.id) {
                          item.taxType = tax;
                        }
                      });
                    }
                  }
                  return item;
                });
              });
            CustomerService.getOne($stateParams.companyId).then(function(data){
                 $scope.companyData = data.data;
            });
        }

        TaxService.getTaxTypes().then(function(data){
            $scope.taxTypeList = data.data.results;
              if($scope.taxData.length){
                $scope.taxData.map(function(item){
                  $scope.taxTypeList.map(function (tax) {
                    if (item.tax_type === tax.id) {
                      item.taxType = tax;
                    }
                  });
                });
              }
          });
    

        $scope.viewProjects = function(table_changes){
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to view company',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select only one item to view company',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if($state.current.name.includes("customers")){
                if($state.current.name.includes("adminDashboard")){
                    $state.go("adminDashboard.customers.viewProjects",{clientId : table_changes.id,type : table_changes.role_type[0]});  
                }else{
                    $state.go("buyerDashboard.customers.viewProjects",{clientId : table_changes.id,type : table_changes.role_type[0]}); 
                }   
            }else{
                if($state.current.name.includes("suppliers")){
                   $state.go("buyerDashboard.suppliers.viewProjects",{clientId : table_changes.id,type : table_changes.role_type[0]});
                }
            }
           
        };

        $scope.cancel= function(){
            if($state.current.name.includes("customers")){
                if($state.current.name.includes("adminDashboard")){
                    $state.go("adminDashboard.customers.list");  
                }else{
                    $state.go("supplierDashboard.customers.list"); 
                }   
            }else{
                if($state.current.name.includes("suppliers")){
                   $state.go("buyerDashboard.suppliers.list");
                }
            }
            
        };

        $scope.editCustomer= function(data){
            if($state.current.name.includes("customers")){
                if($state.current.name.includes("adminDashboard")){
                    $state.go("adminDashboard.customers.edit",{customerId:data.id});  
                }else{
                    $state.go("supplierDashboard.customers.edit",{customerId:data.id}); 
                }  
            }else{
                if($state.current.name.includes("suppliers")){
                    $state.go("buyerDashboard.suppliers.edit",{customerId:data.id}); 
                }
            }
        };

        $scope.ListPage = function(){
            if($state.current.name.includes("customers")){
                if($state.current.name.includes("adminDashboard")){
                    $state.go("adminDashboard.customers.list");  
                }else{
                    $state.go("supplierDashboard.customers.list"); 
                }  
            }else{
                if($state.current.name.includes("suppliers")){
                    $state.go("buyerDashboard.suppliers.list"); 
                }
            }
        };
        
    }]);
})();