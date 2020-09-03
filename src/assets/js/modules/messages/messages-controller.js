(function () {
    var app = angular.module('app');
    app.controller('messagesController', ['$scope', 'MessageService', '$window', '$modal', '$log','$state','InventoryService','DirectoryService',
    function ($scope, MessageService, $window, $modal, $log,  $state,InventoryService,DirectoryService) {
        
        if($scope.current_user.data.is_admin_supplier && $scope.current_user.data.company){
            MessageService.get({supplier_company:$scope.current_user.data.company.id}).then(function (data) {
                console.log(data.data.results);
                $scope.messagesData = data.data.results;
            }, function (err) {
                console.log(err);
            });
        }

        if($scope.current_user.data.id){
            MessageService.get({sender:$scope.current_user.data.id}).then(function (data) {
                console.log(data.data.results);
                $scope.sentMessagesData = data.data.results;
            }, function (err) {
                console.log(err);
            });
        }

        var title=$scope.current_user.data.title;
        
        $scope.tab = 1;
        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
        };
        $scope.isSet = function (tabId) {
            return $scope.tab === tabId;
        };
       
        // Modal code
        $scope.open = open;
        function open(size, message, tabCount, itemCount, closeOnClick) {
            var params = {
                templateUrl: 'popup.html',
                resolve: {
                    items: function () {
                        return $scope.items;
                    },
                },
                controller: function ($scope, $modalInstance, items) {
                    if(tabCount == 2){
                        $scope.secondTab = true;
                    }

                    if(message.inventory.length){
                        if(message.inventory.length>1){
                            $scope.multipleProducts = true;
                            var data = message.inventory;
                            data.forEach(function(item){
                                console.log(item);
                                $scope.itemData = [];
                                InventoryService.getOne(parseInt(item)).then(function(inventory){
                                    $scope.itemData.push(inventory.data);
                                });
                            }); 
                        }
                       else{
                        $scope.multipleProducts = false;
                        InventoryService.getOne(parseInt(message.inventory[0])).then(function(inventory){
                            $scope.itemData = inventory.data;
                        });
                       }
                    }else if(message.directory.length){
                        DirectoryService.getOne(parseInt(message.directory[0])).then(function(directory){
                            $scope.itemData = directory.data;
                        });
                    }

                    $scope.selectedMessage = message;
                   
                    if($scope.selectedMessage.attachments[0]){
                        var splitAttachment = $scope.selectedMessage.attachments[0].split('/');
                      $scope.attachmentName = splitAttachment.pop();
                    }
                    $scope.reposition = function () {
                        $modalInstance.reposition();
                    };

                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.openNested = function () {
                        open();
                    };
                }
            };

            if (angular.isDefined(closeOnClick)) {
                params.closeOnClick = closeOnClick;
            }

            if (angular.isDefined(size)) {
                params.size = size;
            }

            // if (angular.isDefined(backdrop)) {
            //     params.backdrop = backdrop;
            // }

            var modalInstance = $modal.open(params);

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

    }]);
})();