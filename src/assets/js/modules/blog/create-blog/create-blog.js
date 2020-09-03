(function () {
    var app = angular.module('app');
    app.controller('layout.standard.blogController', ['$scope', 'BlogService', '$state', '$mdDialog','Notification','$stateParams','s3Service',
        function ($scope,BlogService, $state, $mdDialog, Notification,$stateParams,s3Service) {
            
            $scope.blog={
                catalogs:[]
            };
            $scope.blogImages=[];
            $scope.uploadCover = false;
            if($stateParams.blogId){
                BlogService.getOne($stateParams.blogId).then(function(res){
                    $scope.blog = res.data;
                });
            }
            
            $scope.uploadBlogImage = function (file, $index, type) {
                $scope.upload = true;
                var path = 'user/' + $scope.current_user.data.id + '/blog/image';
                s3Service.uploadFile(path, file, function (url) {
                    $scope.upload = false;
                    document.getElementById("blog-image").value = null;
                    $scope.blog.catalogs.push(url);
                    Notification.success({
                        message: 'Successfully uploaded file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });
            };

            $scope.removeCoverImage = function(){
                delete $scope.blog.cover_image;
                $scope.uploadCover = false;
            };

            $scope.uploadBlogCoverImage = function(file, $index, type){
                $scope.uploadCover = true;
                var path = 'user/' + $scope.current_user.data.id + '/blog-cover/image';
                s3Service.uploadFile(path, file, function (url) {
                    // $scope.uploadCover = false;
                    document.getElementById("blog-cover-image").value = null;
                    $scope.blog.cover_image = url;
                    Notification.success({
                        message: 'Successfully uploaded file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });
            };

            $scope.removeImages = function(data,$index){
                $scope.blog.catalogs.splice($index,1);
            };
            
            $scope.save = function(data){
            //    blog.description = tinyMCE.activeEditor.getContent();
               if(data.id){
                BlogService.update(data.id,data).then(function(res){
                    Notification.success({
                        message: 'successfully created',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $state.go("adminDashboard.blog.list");
               });
               }else{
                BlogService.post(data).then(function(res){
                    Notification.success({
                        message: 'successfully created',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $state.go("adminDashboard.blog.list");
               });
               } 
               
            };

            $scope.cancel = function(){
                $state.go("adminDashboard.blog.list");

            };

            $scope.tinymceOptions = {
                resize: false,
                plugins: [
                    'link image code media table paste',
                    'advlist autolink lists link image charmap print preview anchor textcolor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste code help wordcount'
                ],
                toolbar: "undo redo styleselect bold italic print forecolor backcolor"
            };
            
        }]);
})();