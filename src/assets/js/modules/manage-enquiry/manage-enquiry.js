(function () {
    var app = angular.module('app');
    app.controller('admin.enquiries', ['$scope', '$window', '$modal', '$log','$state','Notification','MessageService','$http','$mdDialog','OfferService','dateService','$rootScope','$stateParams','$filter',
    function ($scope, $window, $modal, $log,  $state,Notification,MessageService,$http,$mdDialog,OfferService,dateService,$rootScope,$stateParams,$filter) {
        $scope.editOne = false;
        $scope.showLoader = true;
        $scope.showOfferDialog = false;
        $scope.$on('filtersData',function(event,data){
            if(data){
                $scope.showLoader = true;
                loadEnquiriesOuter(10,1,data);
            }
        });
        $scope.type = $stateParams.type;
        function loadEnquiriesSent(params){
            $scope.selectedEnquiries = [];
            MessageService.getEnquirySent(params).then(function(data){
                $scope.count = data.data.count;
                $scope.showLoader = false;
                $scope.totalEnquiries = data.data.results;
                $scope.totalEnquiries = $scope.totalEnquiries.map(function(item){
                    var date = item.created;
                    item.dateFormate = date.slice(0,10);
                    if(item.enquiry_state === 'Enquiry Created' || item.enquiry_state === 'Enquiry Sent'){
                        if($scope.type==='Received'){
                            item.status = 'Enquiry Received';
                        }else{
                            item.status = item.enquiry_state;
                        }
                    }else{
                        item.status = item.enquiry_state;
                    }
                    return item;
                });
            }); 
        }

        function loadEnquiries(params){
            $scope.selectedEnquiries = [];
            MessageService.get(params).then(function(data){
                $scope.count = data.data.count;
                $scope.showLoader = false;
                $scope.totalEnquiries = data.data.results;
                $scope.totalEnquiries.map(function(item){
                    var date = item.created;
                    item.dateFormate = date.slice(0,10);
                    if(item.enquiry_state === 'Enquiry Created' || item.enquiry_state === 'Enquiry Sent'){
                        if($scope.type==='Received'){
                            item.status = 'Enquiry Received';
                        }else{
                            item.status = item.enquiry_state;
                        }
                    }else{
                        item.status = item.enquiry_state;
                    }
                });
            }); 

        }
        function loadEnquiriesReceived(params){
            $scope.selectedEnquiries = [];
            MessageService.getEnquiryReceived(params).then(function(data){
                $scope.count = data.data.count;
                $scope.totalEnquiries = data.data.results;
                $scope.showLoader = false;
                $scope.totalEnquiries = $scope.totalEnquiries.map(function(item){
                    var date = item.created;
                    item.dateFormate = date.slice(0,10);
                    if(item.enquiry_state === 'Enquiry Created' || item.enquiry_state === 'Enquiry Sent'){
                        if($scope.type==='Received'){
                            item.status = 'Enquiry Received';
                        }else{
                            item.status = item.enquiry_state;
                        }
                    }else{
                        item.status = item.enquiry_state;
                    }
                    return item;
                });
            }); 

        }

        function loadEnquiriesOuter(page_size,page,data){
            var params = {};
            if(data){
                params = data;
            }
            params.page_size = page_size;
            params.page = page;
            if($state.current.name.includes("adminDashboard")){
                if($stateParams.enquiryEmails){
                    params.receiver_history__receiver_email = $stateParams.enquiryEmails;
                    loadEnquiries(params);
                }else{
                    loadEnquiries(params);
                }
            }
            if($state.current.name.includes("supplierDashboard")){
                var email = $scope.current_user.data.email; 
                if(email){
                    params.email = email;
                    if($stateParams.enquiryEmails){
                        params.receiver_history__receiver_email = $stateParams.enquiryEmails;
                        loadEnquiriesReceived(params);
                    }else{
                        loadEnquiriesReceived(params);
                    } 
                }
            }
            if($state.current.name.includes("buyerDashboard")){
                var ownerId = $scope.current_user.data.id; 
                if(ownerId){
                    params.ownerId = ownerId;
                }
                if($stateParams.enquiryEmails){
                    params.receiver_history__receiver_email = $stateParams.enquiryEmails;
                    loadEnquiriesSent(params);
                }else{
                    loadEnquiriesSent(params);
                } 
            }
        }

        loadEnquiriesOuter(10,1);

        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            loadEnquiriesOuter(10,pageNo);
        };

        $scope.editEnquiry = function(table_changes){
            $scope.enquiryItem = table_changes;
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            // $state.go('adminDashboard.enquiries.editEnquiry',{messageId:table_changes[0].id});
            if($state.current.name.includes("adminDashboard")){
                $state.go('adminDashboard.enquiries.editEnquiry',{messageId:table_changes[0].id});
            }
            if($state.current.name.includes("supplierDashboard")){
                $state.go('supplierDashboard.enquiries.editEnquiry',{messageId:table_changes[0].id});
            }
            if($state.current.name.includes('buyerDashboard')){
                $state.go('buyerDashboard.enquiries.editEnquiry',{messageId:table_changes[0].id});
            }           
        };
        $scope.selectedValue = function(data,index,value){
            console.log(value);
            if(value){
                $scope.selectedEnquiries.push(data);
            }else{
                $scope.selectedEnquiries.map(function(item,index){
                    if (item.id === data.id) {
                        $scope.selectedEnquiries.splice(index, 1);
                        $scope.selectedEnquiries.length - 1;
                    }
                });
            }
            
        };

        var skipClick = false;
        $scope.viewEnquiry = function (data, skip) {
            if (skip) {
                skipClick = skip;
            } else {
                if (!skipClick) {
                    if($state.current.name.includes("adminDashboard.enquiries.list")){
                        $state.go('adminDashboard.enquiries.viewEnquiries',{enquiryId:data.id});
                    }else if($state.current.name.includes("supplierDashboard.enquiries.list")){
                        $state.go('supplierDashboard.enquiries.viewEnquiries',{enquiryId:data.id});
                    }else{
                        $state.go('buyerDashboard.enquiries.viewEnquiries',{enquiryId:data.id});
                    }
                   
                }
                skipClick = false;
            }
        };
        
        function getCompanyId(){
            if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company){
                return $scope.current_user.data.company.id;
            }else{
                return;
            }
        }
        
        $scope.cancelEnquiry = function(){
            $scope.editOne = false;
            $scope.show = {edit : true};   
        };
        
        // $scope.createEnquiry = function(){
        //     $state.go('adminDashboard.enquiries.createEnquiry');
        // };
        $scope.createEnquiry = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go('adminDashboard.enquiries.createEnquiry');
            }
            if($state.current.name.includes("supplierDashboard")){
                $state.go('supplierDashboard.enquiries.createEnquiry');
            }
            if($state.current.name.includes('buyerDashboard')){
                $state.go('buyerDashboard.enquiries.createEnquiry');
            }
            
        };
        
        function getUserData(){
            if($scope.current_user){
                return $scope.current_user.data;
            }
        }

        $scope.makeOffer = makeOffer;
        
        function makeOffer(size,record,data,backdrop, closeOnClick){
            var companyId = getCompanyId();
            $scope.showOfferDialog = true;
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
            record = record[0];
            var params = {
                templateUrl: "makeOffer.html",
                resolve: {
                   
                },
                controller: function ($scope,$rootScope,$modalInstance) {
                    
                    $scope.offer = {};
                    $scope.offer.enquiry = record.id;
                    $scope.mtoEnquiryId = record.id;
                    $scope.offer.supplier = getCompanyId();
                    var userData = getUserData();
                    $scope.offer.userId = userData.id;
                  $scope.$on("offerClose",function(ev,data){
                    loadEnquiriesOuter(10,1);                
                    $modalInstance.dismiss('cancel');
                  });
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
              
              var modalInstance = $modal.open(params);
      
              modalInstance.result.then(function (selectedItem) {
                $scope.setPage($scope.currentPage); 
              }, function () {
                $log.info('Modal dismissed at: ' + new Date());
              });
        }

        $scope.sendEnquiry = sendEnquiry;

        function sendEnquiry(record,data,ev) {

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
            record = record[0];
            $scope.userInfo = getUserData();
            var id= record.id;
            data.forEach(function(item){
                if(item.id === id){
                    $scope.message = item;
                }
            });        
            return $mdDialog.show({
                controller: 'admin-send-enquiry',
                templateUrl: 'assets/js/modules/directory/states/list/views/content/modalpopup/admin-send-enquiry/admin-send-enquiry.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple: true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScopeList: {
                        message : $scope.message,
                        userInfo : $scope.userInfo
                    }
                }
            }).then(function(){
                $scope.selectedEnquiries =[];
                loadEnquiriesOuter(10,1);
            });


            
            
            // var params = {
            //   templateUrl: "admin-send-enquiry.html",
            //   resolve: {
                 
            //   },
            //   controller: function ($scope, $modalInstance) {
                
                 
               
            //     $scope.ok = function () {
            //       $modalInstance.close();
            //     };
    
            //     $scope.cancel = function () {
            //       $modalInstance.dismiss('cancel');
            //     };
            //   }
            // };
    
            // if (angular.isDefined(closeOnClick)) {
            //   params.closeOnClick = closeOnClick;
            // }
    
            // if (angular.isDefined(size)) {
            //   params.size = size;
            // }
            
            // var modalInstance = $modal.open(params);
    
            // modalInstance.result.then(function (selectedItem) {              
            //     $scope.setPage($scope.currentPage); 
            // }, function () {
            //   $log.info('Modal dismissed at: ' + new Date());
            // });
          }

        $scope.viewEnquiryOffers = function (data) {
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.offers.list",{data:data,type:'Received'});
            }else if($state.current.name.includes("supplierDashboard")){
                $state.go("supplierDashboard.offers.list",{data:data,type:'Sent'});
            }else if($state.current.name.includes("buyerDashboard")){
                $state.go("buyerDashboard.offers.list",{data:data,type:'Received'});
            }
        }; 

        $scope.deleteEnquiry = function(data){
            if(data.length === 0){
                Notification.error({
                    message: 'Please select atleast one item to Delete',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            var list =[];
            data.map(function(item){
                MessageService.delete(item.id).then(function (res) {
                    list.push(res.data);
                    if(list.length == data.length){
                        loadEnquiriesOuter(10,1);
                        Notification.error({
                            message: 'successfully deleteed',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $timeout(function() {
                            $window.location.reload();
                        }, 1800);
                    }
                });
            });
        };

    }]);
})();
