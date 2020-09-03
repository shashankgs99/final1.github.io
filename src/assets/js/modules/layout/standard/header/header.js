  (function(){
    angular.module('app')
   .controller('layout.header.controller',[
    '$scope', '$injector', 'FaqService',
    function($scope, $injector, FaqService){
        
        $scope.$on('companyIntroHeader', function (event, data) {
            $scope.hideHeaderNavigation = data.hideHeaderNavigation;
        });

        $injector.loadNewModules(['mm.foundation']);

        FaqService.get().then(function(data){
          $scope.faqdata=data.data.results;
        //   console.log($scope.faqdata);
        });
        $scope.accordion = {
          current: null
        };
        
    }])
    .controller('layout.stores.help',[
      '$scope', '$stateParams','$window',
      function($scope, $stateParams,$window){
        $scope.type = $stateParams.type;
      }]);
})();