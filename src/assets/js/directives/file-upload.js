(function(){
    angular.module('app')
    
    // <input type="file" file-model="myFile"/> myFile is the ngModel
    // We can use var file = $scope.myFile;
    // More here http://jsfiddle.net/JeJenny/ZG9re/

    .directive('fileModel', ['$parse', function ($parse) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;
              
              element.bind('change', function(){
                  scope.$apply(function(){
                      modelSetter(scope, element[0].files[0]);
                  });
              });
          }
      };
    }])
    .directive('validFile', ['$parse', function ($parse) {
      return {
        scope : {format: '@', upload : '&upload'},
        link : function(scope, el, attrs) {
          // change event is fired when file is selected
          el.bind('change', function(event) {
            scope.upload({file:event.target.files[0]});
          })
        }
      }
    }])
    .directive('fileReader', function() {
        return {
          scope: {
            fileReader:"=",
            onLoadCallback: '&'
          },
          link: function(scope, element,type) {
            element.bind('change', function(changeEvent) {
              var files = changeEvent.target.files;
              if (files.length) {
                var r = new FileReader();
                r.onload = function(e) {
                    var contents = e.target.result;
                    scope.$apply(function () {
                      scope.fileReader = contents;
                      scope.testing = contents;
                    });
                    scope.onLoadCallback();
                };
                
                r.readAsText(files[0]);
              }
            });
          }
        };
      })
      .directive('ngMultiFileModel', ['$parse', 's3Service', function ($parse, s3Service) {
        return {
          restrict: 'A',
          controller: function($scope, s3Service, Notification, $rootScope){
            $scope.files = [];
          },
          scope: {
            ngMultiFileModel:"=",
            onLoadCallback: '&'
          },
          link: function (scope, element, attrs, ctrl) {
            var isMultiple = attrs.multiple;
            element.bind('change', function () {
              angular.forEach(element[0].files, function (item) {
                scope.files.push(item);
              });
              scope.$apply(function () {
                if (isMultiple) {
                  scope.ngMultiFileModel = scope.files;
                } else {
                  scope.ngMultiFileModel = scope.files[0];
                }
              });
              scope.onLoadCallback();
            });
          }
        };
      }]);

})();