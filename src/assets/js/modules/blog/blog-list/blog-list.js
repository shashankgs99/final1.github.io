(function () {
    var app = angular.module('app');
    app.controller('layout.standard.blogListController', ['$scope','$state', '$mdDialog','Notification','$stateParams','BlogService',
        function ($scope,$state, $mdDialog, Notification,$stateParams,BlogService) {

            loadBlogList({ page_size: 10, page: 1 });
            $scope.currentPage = 1;
            $scope.selectedBlog =[];
            $scope.maxSize = 10;
            $scope.showLoader = true;
            function loadBlogList(data) {
                BlogService.get(data).then(function (data) {
                    $scope.count = data.data.count;
                    $scope.showLoader = false;
                    $scope.blogList = data.data.results;
                });
            }

            $scope.setPage = function (pageNo) {
                $scope.showLoader = true;
                $scope.currentPage = pageNo;
                loadBlogList({ page_size: 10, page: pageNo });
            };
         
            $scope.createBlog = function(data){
                $state.go("adminDashboard.blog.add");
            };

            $scope.editBlog = function(data){
                if(data.length === 0){
                    Notification.error({
                        message: 'Please select atleast one item to edit',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(data.length > 1){
                    Notification.error({
                        message: 'Please select one item to edit',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                $state.go("adminDashboard.blog.edit",{blogId:data[0].id});
            };

            $scope.viewBlog = function(data){
                if(data.length === 0){
                    Notification.error({
                        message: 'Please select atleast one item to edit',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(data.length > 1){
                    Notification.error({
                        message: 'Please select one item to edit',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                $state.go("adminDashboard.blog.view",{blogId:data.id});
            };

            $scope.selectedValue = function (data,index,value) {
                if (value) {
                  $scope.selectedBlog.push(data);
                } else {
                  $scope.selectedBlog.map(function (item, index) {
                    if (item.id === data.id) {
                      $scope.selectedBlog.splice(index, 1);
                      $scope.selectedBlog.length - 1;
                    }
                  });
                }
              };
       
        }]);
})();