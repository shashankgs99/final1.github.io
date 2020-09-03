(function(){
    var app = angular.module('app');
     // //Handsontable Pagination Feature (Optional)
    
    app.directive('loaderStyleOne',['$location','$window','$injector','$timeout',function($location,$window,$injector,$timeout){
      var directive = {};
      directive.replace = true;
      directive.restrict = 'AE';
      directive.scope = {};  // No new scope
      directive.templateUrl = '/assets/js/directives/loader/data-loader.html';
      directive.link = function(scope, el, attr){
        console.log('Directive loaded');
      }
      return directive;
    }]);
})();