(function () {
    var app = angular.module('app');
    app.controller('layout.standard.customerController', ['$scope', '$state','Notification','CustomerService','UserService','$timeout','$window',
    function ($scope,$state,Notification,CustomerService,UserService,$timeout,$window) {
        $scope.showLoader = true;
        loadCustomerData({ page_size: 10, page: 1 });
        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.params ={};
        $scope.selectedCustomer = [];
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            loadCustomerData({ page_size: 10, page: pageNo });
        };
        
        $scope.selectedValue = function (data, index, value) {
            if (value) {
                $scope.selectedCustomer.push(data);
            } else {
                $scope.selectedCustomer.splice(index, 1);
            }
        };

        UserService.getRoleTypes().then(function(roleData){
            $scope.userRoles = roleData.data.results;
        });
        
        $scope.ownerId = $scope.current_user.data.id;
        $scope.tinymceOptions = {
            resize: false,
            width: 1160,
            height: 130,
            plugins: 'print textcolor',
            toolbar: "undo redo styleselect bold italic print forecolor backcolor",
            setup : function(ed){
                ed.on('NodeChange', function(e){
                    $scope.message = ed.getContent(); 
                });
           }
        };
      
        // $scope.editCustomer = function(table_changes){
        //     $scope.customerData = table_changes;
        //     if (table_changes.length === 0) {
        //         Notification.error({
        //             message: 'Please select atleast one item to edit',
        //             positionX: 'right',
        //             positionY: 'top'
        //         });
        //         return;
        //     }
        //     if (table_changes.length > 1) {
        //         Notification.error({
        //             message: 'Please select only one item to edit',
        //             positionX: 'right',
        //             positionY: 'top'
        //         });
        //         return;
        //     }

        //     if ($state.current.name.includes("adminDashboard")) {
        //         $state.go("adminDashboard.customers.edit", { customerId: table_changes[0][4] });
        //     }else{
        //         $state.go("supplierDashboard.customers.edit", { customerId: table_changes[0][4] });
        //     }
            
        // };

        $scope.editCustomer = function (data) {
            if (data.length > 1) {
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.edit", { customerId: data[0].id });
            } else {
                $state.go("supplierDashboard.customers.edit", { customerId: data[0].id });
            }
        };

        $scope.cancelCustomer = function () {
            if($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.list");
            }else{
                $state.go("supplierDashboard.customers.list");
            }
        };

        $scope.addCustomer = function(){
            if($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.create");
            }else{
                $state.go("supplierDashboard.customers.create");
            }
        };

        // $scope.viewCompany = function(table_changes){
        //     if(table_changes.length === 0){
        //         Notification.error({
        //             message:'Please select atleast one item to view company',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     if(table_changes.length > 1){
        //         Notification.error({
        //             message:'Please select only one item to view company',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     if($state.current.name.includes("adminDashboard")){
        //         $state.go("adminDashboard.customers.viewCompany",{companyId : table_changes[0][4]});  
        //     }else{
        //         $state.go("supplierDashboard.customers.viewCompany",{companyId : table_changes[0][4]}); 
        //     }   
        // };

        $scope.viewCompany =function(data){
            if (data.length > 1) {
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.viewCompany", { companyId: data[0].id });
            } else {
                $state.go("supplierDashboard.customers.viewCompany", { companyId: data[0].id });
            } 

        };

        $scope.viewCompanyDetails = function(data){
            if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.viewCompany", { companyId: data.id });
            } else {
                $state.go("supplierDashboard.customers.viewCompany", { companyId: data.id });
            } 
        };

        // $scope.viewProjects = function(table_changes){
        //     if(table_changes.length === 0){
        //         Notification.error({
        //             message:'Please select atleast one item to view company',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     if(table_changes.length > 1){
        //         Notification.error({
        //             message:'Please select only one item to view company',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     CustomerService.getOne(table_changes[0][4]).then(function(data){
        //         if(data.data){
        //            var type = data.data.role_type[0];
        //             if($state.current.name.includes("adminDashboard")){
        //                 $state.go("adminDashboard.customers.viewProjects",{clientId : table_changes[0][4],type:type});  
        //             }else{
        //                 $state.go("supplierDashboard.customers.viewProjects",{clientId : table_changes[0][4],type:type}); 
        //             } 
        //         }   
        //     });
            
        // };

        $scope.viewProjects = function(data){
            if (data.length > 1) {
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }

                if (data) {
                    var type = data[0].role_type;
                    if ($state.current.name.includes("adminDashboard")) {
                        $state.go("adminDashboard.projects.list", { customer : data[0]});
                    } else {
                        $state.go("supplierDashboard.projects.list", { customer : data[0]});
                    }
                } 
           
        };

        $scope.deleteCustomer = function(data){
            if(data.length === 0){
                Notification.error({
                    message: 'Please select atleast one item to Delete',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            var deletedRecords = [];
            data.map(function(item){
                CustomerService.delete(item.id).then(function(res){
                   deletedRecords.push(res.data);
                   if(deletedRecords.length == data.length){
                      Notification.success({
                        message: 'Successfully deleted',
                        positionX: 'right',
                        positionY: 'top'
                      });
                      $scope.selectedCustomer =[];
                      loadCustomerData({ page_size: 10, page: 1 });
                   }
                });
            });
           
        }

        $scope.addMultiple = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.customers.multipleCustomers"); 
            }else{
                $state.go("supplierDashboard.customers.multipleCustomers");
            }
        }; 
           

        $scope.addContacts = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.customers.addContacts"); 
            }else{
                $state.go("supplierDashboard.customers.addContacts");
            }
        };


        function loadCustomerData(data){
            CustomerService.get(data).then(function(data){
                $scope.count = data.data.count;
                $scope.customersList = data.data.results;
                $scope.customersList = $scope.customersList.map(function(item){
                    if(item.role_type){
                        item.role_type.map(function(data){
                            $scope.userRoles.map(function(role){
                                if(role.id == data){
                                    item.roleType = role.role_type_name;
                                }
                            });
                        });
                    } 
                    return item;
                });
                $scope.showLoader = false;
            });
        }

	$scope.viewContacts = function(data){
            if (data.length > 1) {
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            $state.go("supplierDashboard.customers.viewContacts",{data:data,companyId:data[0].id});
            
        };
        

	//customer-filters
          $scope.CustomersFilters = function (data) {
            if (data.selectedItem) {
                $scope.params.owner = data.selectedItem.id;
            }
            if (data.date_from) {
                var date = new Date(data.date_from);
                var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var result = dateString.replace(/['"]+/g, '');
                $scope.params.created_date__gte = result;
            }
            if (data.date_to) {
                var date = new Date(data.date_to);
                var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var result = dateString.replace(/['"]+/g, '');
                $scope.params.created_date__lte = result;
            }
            if (data.name) {
                $scope.params.name__icontains = data.name;
            }
            $scope.params.page_size= 10;
            $scope.params.page=1;

            loadCustomerData($scope.params);

        };

        $scope.clear= function(){
            $scope.filter={};
            $scope.params ={};
            $scope.params.page_size= 10;
            $scope.params.page=1;

            loadCustomerData($scope.params);
        }
    }]);
})();