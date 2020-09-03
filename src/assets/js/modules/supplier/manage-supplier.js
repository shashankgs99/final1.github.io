(function () {
    var app = angular.module('app');
    app.controller('layout.standard.supplierController', ['$scope', '$state','Notification','CustomerService','BuyerSupplierService','UserService','$timeout','$window',
    function ($scope,$state,Notification,CustomerService,BuyerSupplierService,UserService,$timeout,$window) {
        $scope.showLoader = true;
        $scope.$on('supplierFIlters',function(event,data){
            if(data){
                $scope.showLoader = true;
                data.page_size=10;
                data.page=1;
                loadSupplierData(data);
            }
        });
        
        loadSupplierData({ page_size: 10, page: 1 });
        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.suppliers = [];

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            loadSupplierData({ page_size: 10, page: pageNo });
        };
        
        $scope.selectedValue = function (data, index, value) {
            if (value) {
                $scope.suppliers.push(data);
            } else {
                $scope.suppliers.splice(index, 1);
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
        $scope.editSupplier = function (data) {
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
            $state.go("buyerDashboard.suppliers.edit",{customerId:data[0].id});
        };

        $scope.addSupplier = function(){
            $state.go("buyerDashboard.suppliers.create"); 
        };

        $scope.viewEnquiries = function(table_changes){
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to view enquiries',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select only one item to view enquiries',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            CustomerService.getOne(table_changes[0][4]).then(function(data){
                var emails=[];
                var supplier=[];
                var info = data.data;
                if(info){
                    if(info.contacts.length){
                        var contactsInfo = info.contacts;
                        contactsInfo.map(function(item){
                           if(item.emailid1){
                               emails.push(item.emailid1);
                               supplier.push({id:info.id,name:info.name});
                           }
                           if(item.emailid2){
                               emails.push(item.emailid2);
                               supplier.push({id:info.id,name:info.name});
                           }
                        });
                    }
                } 
                supplier = _.uniqBy(supplier,'id');
                enquiryEmails = _.uniq(enquiryEmails);
                $state.go("buyerDashboard.offers.List",{enquiryEmails:emails,supplier:supplier[0]}); 
            });   
            
        };

        $scope.addMultiple = function(){
            $state.go("buyerDashboard.suppliers.addMultiple");
        };

    
        $scope.viewCompany = function(data){
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
            $state.go("buyerDashboard.suppliers.viewCompany",{companyId : data[0].id});
        };

        $scope.viewCompanyDetails = function(data){
            if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.suppliers.viewCompany", { companyId: data.id });
            } else {
                $state.go("buyerDashboard.suppliers.viewCompany",{companyId : data.id});
            } 
        }


        $scope.viewOffers = function (data) {
            if (data.length > 1) {
                Notification.error({
                    message: 'Please select  one item ',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'Please select only one item ',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            CustomerService.getOne(data[0].id).then(function (data) {
                var emails = [];
                var supplier = [];
                var info = data.data;
                if (info) {
                    if (info.contacts.length) {
                        var contactsInfo = info.contacts;
                        contactsInfo.map(function (item) {
                            if (item.emailid1) {
                                emails.push(item.emailid1);
                                supplier.push({ id: info.id, name: info.name });
                            }
                            if (item.emailid2) {
                                emails.push(item.emailid2);
                                supplier.push({ id: info.id, name: info.name });
                            }
                        });
                    }
                }
                supplier = _.uniqBy(supplier, 'id');
                emails = _.uniq(emails);
                $state.go("buyerDashboard.offers.List", { emails: emails, supplier: supplier[0] });
            });
        };

        $scope.deleteSupplier = function(data){
            if(data.length === 0){
                Notification.error({
                    message: 'Please select atleast one item to Delete',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            var deletedRecords =[];
            var list = angular.copy(data);
            data.map(function(item){
                BuyerSupplierService.delete(item.id).then(function(data){
                    deletedRecords.push(data.data);
                    if(deletedRecords.length == list.length){
                        Notification.success({
                            message: 'Successfully deleted',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          $timeout(function() {
                            $window.location.reload();
                          }, 1300);
                    }
                });
            });           
        }

      

        function loadSupplierData(data){
            BuyerSupplierService.get(data).then(function(data){
                $scope.count = data.data.count;
                $scope.suppliersList = data.data.results;
                $scope.showLoader = false;
                $scope.suppliersList = $scope.suppliersList.map(function(item){
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
            });
        }

        $scope.addContacts = function(){
             $state.go("buyerDashboard.suppliers.addContacts");
        };

        $scope.addCategories = function(){
            $state.go("buyerDashboard.suppliers.addCategories");
        };

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
            $state.go("buyerDashboard.suppliers.viewContacts",{data:data,companyId:data[0].id});
            
        };

        $scope.viewCategories = function(data){
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
            $state.go("buyerDashboard.suppliers.viewCategories",{companyId:data[0].id});
        };

    }]);
})();