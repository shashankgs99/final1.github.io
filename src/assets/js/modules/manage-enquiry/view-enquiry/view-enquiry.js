(function(){
    angular.module('app')
   .controller('view.enquiries',['$scope', '$modal', '$log','$state','Notification','MessageService','OfferService','$stateParams','EnquiryHistoryService','$mdDialog','MTOService','$timeout','UserService','CustomerService','$q',
   function($scope, $modal, $log, $state, Notification, MessageService, OfferService, $stateParams,EnquiryHistoryService,$mdDialog,MTOService,$timeout,UserService,CustomerService,$q){
    
    function getUserData(){
        if($scope.current_user){
            return $scope.current_user.data;
        }
    }
    MessageService.getEnquiryStates().then(function(res){
        $scope.statusList = res.data.results;
    });

    $scope.type = $stateParams.type;  
    function loadData(){
        MessageService.getOne($stateParams.enquiryId).then(function(data){
            $scope.viewenquiry = data.data;
            if($scope.viewenquiry.enquiry_type){
                $scope.viewenquiry.enquiry_type.name = $scope.viewenquiry.enquiry_type.name;
            }
            if($scope.viewenquiry.project){
                if($scope.viewenquiry.project.customer_contractor){
                    $scope.viewenquiry.project.customer_contractor.name = $scope.viewenquiry.project.customer_contractor.name;
                }
                if($scope.viewenquiry.project.parent_project){
                    $scope.viewenquiry.parent_project = $scope.viewenquiry.project.parent_project.name;
                    $scope.viewenquiry.sub_project = $scope.viewenquiry.project.name;
                }else{
                    $scope.viewenquiry.parent_project = $scope.viewenquiry.project.name;
                }
            }
            if($scope.viewenquiry.attachments){
                $scope.viewEnquiryImages = [];
                $scope.viewenquiry.attachments.forEach(function(item){
                    var enquiryImage = item.split('/');
                    $scope.viewEnquiryImages.push(item);
                });
            }        
        });
        if($stateParams.type === 'Received'){
            if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company){
                OfferService.get({enquiry:$stateParams.enquiryId,supplier:$scope.current_user.data.company.id}).then(function(data){
                    $scope.offers = data.data.results;                
                });
            }
        }else if($stateParams.type === 'Sent'){
            OfferService.getOfferReceived({enquiryId:$stateParams.enquiryId}).then(function(data){
                $scope.offers = data.data.results;
            });
        }
        var params = {};
        params.enquiryId = $stateParams.enquiryId;
        if($stateParams.type === 'Received'){
            params.receiver_email = $scope.current_user.data.email;
        }
        EnquiryHistoryService.get(params).then(function(data){
            $scope.receiverHistory = data.data.results;
            $scope.UiGridOptions.data = $scope.receiverHistory;
            $scope.UiGridOptions.data = $scope.UiGridOptions.data.map(function(item,$index){
                item.checked = false;
                item.index = $index+1;
                // item.status = item.enquiry.enquiry_state;
                item.changed = false;
                return item;
            });
        });

        MTOService.get({enquiryId:$stateParams.enquiryId}).then(function(response){
            $scope.mtoItems = response.data.results;
        });
    }

    if($stateParams.enquiryId){
        loadData();
    }
    MessageService.get().then(function(data){
        $scope.count = data.data.count;
        $scope.totalEnquiries = data.data.results;
    }); 
     
    $scope.editEnquiry = function(data){
        if($state.current.name.includes("adminDashboard")){
            $state.go('adminDashboard.enquiries.editEnquiry',{messageId:data.id});
          }else if($state.current.name.includes("supplierDashboard")){
            $state.go('supplierDashboard.enquiries.editEnquiry',{messageId:data.id});
          }else{
            $state.go('buyerDashboard.enquiries.editEnquiry',{messageId:data.id});
          }
        
    }

    $scope.sendEnquiry = sendEnquiry;
        
    function sendEnquiry(ev,record,data) {
        $scope.userInfo = getUserData();
        // $scope.message = record;
        return $mdDialog.show({
            controller: 'admin-send-enquiry',
            templateUrl: 'assets/js/modules/directory/states/list/views/content/modalpopup/admin-send-enquiry/admin-send-enquiry.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            multiple: true,
            clickOutsideToClose: true,
            locals: {
                $dialogScopeList: {
                    message : record,
                    userInfo : $scope.userInfo
                }
            }
        }).then(function(){
            loadData();
        });

       
    }

    $scope.back = function(){ 
        if($state.current.name.includes("adminDashboard")){
           $state.go("adminDashboard.enquiries.list");
       }else if($state.current.name.includes("supplierDashboard")){
           $state.go("supplierDashboard.enquiries.list");
       }else{
           $state.go("buyerDashboard.enquiries.list");
       }
        
    };

    function getCompanyId(){
        if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company){
            return $scope.current_user.data.company.id;
        }else{
            return;
        }
    }
    
    function getUserData(){
        if($scope.current_user){
            return $scope.current_user.data;
        }
    }
   
    $scope.makeOffer = makeOffer;
        
    function makeOffer(ev,record,totalData){
        var companyId = getCompanyId();
        if(!companyId){
            Notification.error({
                message:'Register as supplier-admin to create offer',
                positionX:'right',
                positionY:'top'
              });
              return; 
        }
        if(record.length > 1){
            Notification.error({
                message:'please select one item',
                positionX:'right',
                positionY:'top'
                });
                return;
        }
        if(record.length <1){
            Notification.error({
                message:'please select atleast one item',
                positionX:'right',
                positionY:'top'
                });
                return;
        }
        $mdDialog.show({
            controller: 'manage.offerDialogController',
            templateUrl: 'assets/js/modules/manage-offers/offer-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            multiple:true,
            locals: {
                $dialogScope: {
                    enquiry : record.id,
                    mtoEnquiryId : record.id,
                    supplier : companyId,
                    userData : $scope.current_user.data

                }
            }
        }).then(function (res) {
            if($stateParams.type === "Received"){
                getOfferSent();
                loadData();
            }
        }, function () {
        });
    }

    function getOfferSent(){
        OfferService.get({enquiry:$stateParams.enquiryId,supplier:$scope.current_user.data.company.id}).then(function(data){
            $scope.offers = data.data.results;                
        });
    }

    $scope.viewOffer = function(offer){
        if($state.current.name.includes("adminDashboard")){
            $state.go("adminDashboard.offers.viewOffer",{offerId:offer.id,type:$stateParams.type==='Sent'?'Received':'Sent'});
        }else if($state.current.name.includes("supplierDashboard")){
            $state.go("supplierDashboard.offers.viewOffer",{offerId:offer.id,type:'Sent'});
        }else if($state.current.name.includes("buyerDashboard")){
            $state.go("buyerDashboard.offers.viewOffer",{offerId:offer.id,type:'Received'});
        }
    };

    $scope.openDialog = function(ev){
       
        $mdDialog.show({
            controller: 'viewProductDatatable',
            templateUrl: 'assets/partials/dashboard/buyer/view-product-datatable.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                $dialogScope: {
                    finalData: $scope.mtoItems,
                    fileAccess:{save : true}
                }
            }
        }).then(function (res) {
        }, function () {
        });
    };

    $scope.deleteOneEnquiry = function(enquiry){
        if(enquiry && enquiry.id){
            MessageService.delete(enquiry.id).then(function(response){
                Notification.success({
                    message: 'Successfully deleted enquiry',
                    positionX: 'right',
                    positionY: 'top'
                });
                $timeout(function () {
                    if($state.current.name.includes("adminDashboard")){
                        $state.go("adminDashboard.enquiries.list");
                    }else if($state.current.name.includes("supplierDashboard")){
                        $state.go("supplierDashboard.enquiries.list");
                    }else{
                        $state.go("buyerDashboard.enquiries.list");
                    }
                }, 1000);
            });
        }
    };

       $scope.viewStatus = function () {
           $state.go("buyerDashboard.enquiries.enquiryStatus");
       };

       $scope.UiGridOptions = {
        enableCellEditOnFocus: true,
        enableColumnResizing: true,
        enableFiltering: true,
        enableGridMenu: true,
        showGridFooter: true,
        showColumnFooter: true,
        fastWatch: true,
        columnDefs : [
            {
                name: 'checked',
                displayName: '',
                cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
            },
            {
                name: 'index',
                displayName: 'S.NO',
                width: 75,
                pinnedLeft: true,
                enableCellEdit: false,
                enableSorting: false,
            },
            {
                field: 'contact.name',
                displayName: 'Company',
                width: 150,
                pinnedLeft: true,
                enableCellEdit: false,
                enableSorting: false,
            },
            {
                field: 'contact.contacts[0].firstname',
                displayName: 'Contact',
                width: 200,
                pinnedLeft: true,
                enableCellEdit: false,
                enableSorting: false,
            },
            {
                field: 'contact.emailid1',
                displayName: 'Email',
                width: 150,
                pinnedLeft: true,
                enableSorting: true,
                enableCellEdit: false,
                visible:!$scope.reverseGrnData
            },
            {
                field: 'enquiry.enquiry_state',
                displayName: 'Status',
                width: 150,
                pinnedLeft: true,
                enableSorting: true,
                enableCellEdit: false,
            },
            {
                field: 'remarks',
                displayName: 'Remarks',
                width: 150,
                pinnedLeft: true,
                enableSorting: true,
                enableCellEdit: false,
            }
        ]
    };

    $scope.UpdateStatus = function(data,ev){
        var checked = [];
        data.map(function(record){
            if(record.checked){
                checked.push(record);
            }
        });
        if(checked.length){
            return $mdDialog.show({
                controller: 'layout.order.updateGRNItems',
                templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                       display:'enquiry',
                    }
                }
            }).then(function(res){
                 if(res){
                    $scope.UiGridOptions.data = $scope.UiGridOptions.data.map(function(item,$index){
                        if(item && item.checked){
                            if(res.status){
                                item.status = res.status;
                                item.changed = true;
                            }
                            if(res.remarks){
                                item.remarks = res.remarks;
                                item.changed = true;
                            }
                        }
                        return item;
                    });
                    $scope.saveStatus();
                 }
            });
        }else{
            Notification.error({
                message: 'please select items',
                positionX: 'right',
                positionY: 'top'
            }); 
        }
        
    };
    
    $scope.selectAll = function(data){
        if(!data){
            $scope.UiGridOptions.data = $scope.UiGridOptions.data.map(function(item){
                item.checked = true;
                item.index = $index+1;
                return item;
            });
        }else{
            $scope.UiGridOptions.data = $scope.UiGridOptions.data.map(function(item){
                item.checked = false;
                item.index = $index+1;
                return item;
            });
        }
    };

    $scope.saveStatus = function(){
         var data = [];
         var resp=[];
         $scope.UiGridOptions.data.map(function(item){
             if(item && item.changed){
                 data.push(item);
             }
         });
         if(data.length){
            data.map(function(item){
              var obj={};
              if(item.status){
                obj.status = item.status;
              }
              if(item.remarks){
                obj.remarks = item.remarks;
              }
              EnquiryHistoryService.update(item.id,obj).then(function(res){
                resp.push(res.data);
                if(data.length == resp.length){
                    var status = {};
                    if(obj.status == 'Offers Received'){
                        $scope.statusList.map(function(rec){
                           if(obj.status == rec.name){
                             status.enquiry_state = rec.id;
                           }
                        });
                    }
                    if(obj.status == 'Offers Evaluated' || obj.status == 'Offers Rejected'|| obj.status == 'Under Negotiations'){
                        $scope.statusList.map(function (rec) {
                            if (rec.name == 'Offers Evaluated') {
                                status.enquiry_state = rec.id;
                            }
                        });
                    }
                    if(obj.status == 'Letter of Intent'){
                        $scope.statusList.map(function (rec) {
                            if (rec.name == 'Awarded') {
                                status.enquiry_state = rec.id;
                            }
                        });
                    }
                    if(obj.status == 'Regretted'){
                        $scope.statusList.map(function (rec) {
                            if (rec.name == 'Regretted') {
                                status.enquiry_state = rec.id;
                            }
                        });
                    }
                    if(Object.keys(status).length){
                        MessageService.update($stateParams.enquiryId,status).then(function(res){
                            loadData();
                            Notification.success({
                                message: 'successfully saved',
                                positionX: 'right',
                                positionY: 'top'
                            }); 
                        });
                    }else{
                        loadData();
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        }); 
                    }
                }
              });
            });
         }else{
            Notification.error({
                message: 'please change status',
                positionX: 'right',
                positionY: 'top'
            });
         }
    };

}]);
})();
