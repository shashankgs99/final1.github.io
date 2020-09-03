(function(){
    //1. Initialize Angular App
    var app = angular.module('app',[
        "oc.lazyLoad",
        'ngAnimate',
        'ngSanitize',
        'ngTouch',
        'ngMaterial',
        'ngMessages',
        'ngCookies',
        'LocalStorageModule',
        'ui.router',
        'md.data.table',
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.pagination',
        'ui.grid.exporter',
        'chart.js',
        'slickCarousel',
        'ngSentry'
              ])
        .run(['$anchorScroll', function ($anchorScroll) {
            $anchorScroll.yOffset = 50;   // always scroll by 50 extra pixels
        }]);
})();

