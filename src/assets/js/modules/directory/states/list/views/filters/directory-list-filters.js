//directory.list.filters.controller

(function(){
  
  var app = angular.module('app');

  app.controller('directory.list.filters.controller',[
    '$scope',
    '$window',
    '$state',
    '$stateParams',
    '$timeout','CityService', function($scope,$window,$state,$stateParams,$timeout,CityService){

    // Initialize Filters
    console.log($stateParams);
    if($stateParams.category){
      $scope.directory_data.filters.category = $stateParams.category;
    }
    if($stateParams.cities){
      $scope.directory_data.filters.cities = $stateParams.cities;
    }

    // $scope.loadSuppliers($scope.directory_data.filters);

    $scope.addToFilters = function(data,where){
      console.log("Adding to Filters");
      $scope.directory_data.filters[where] = data;      
    }

    $scope.clearFilters = function(){
      $scope.directory_data.filters = {};
      $scope.selectedCitiesModel = [];
      // Reload State with updated Filters
      $state.go(
        'layout.standard.directory.list.views',{category:null,city:null});
    };

    $scope.applyFilters = function(){
      // Reload State with updated Filters
      var countries = $scope.selectedCountriesModel.map(function(item){ return item.id;});
      var states = $scope.selectedStatesModel.map(function(item){ return item.id;});
      var cities = $scope.selectedCitiesModel.map(function(item){ return item.id;});
      $state.go(
        'layout.standard.directory.list.views',{
          category: $scope.directory_data.filters.category,
          country: countries,
          state: states,
          city: cities
        });
    }

    // Load All Cities
    CityService.get().then(function(data){
      $scope.directory_data.cities = data.data.results;

      $scope.countryDataResults = data.data.results;

      $scope.country = [];
      $scope.states = [];
      $scope.cities = [];

      $scope.countryDataResults.filter(function(obj){ 
        if($scope.country.indexOf(obj.country)<0 && obj.country != null){ 
          $scope.country.push(obj.country); 
          return obj; 
        } 
        });

    },function(error){
      console.log(error);
    });

    var selectedCountries=[];
    var selectedStates = [];

    $scope.selectedCountriesModel = [];
    $scope.countryDropdownSettings = {enableSearch: true, displayProp:'country'};

      $scope.onCountryChange = {
        onItemSelect: function (countryObj) {

          selectedCountries.push(countryObj);
          for (var i = 0; i < selectedCountries.length; i++) {
            var country = selectedCountries[i].id;

            $scope.countryDataResults.filter(function (obj) {
              if (obj.country === country && $scope.states.indexOf(obj.state) < 0 && obj.state != null) {
                $scope.states.push(obj.state); return obj;
              }
            });
          }

        },
        onItemDeselect: function (item) {
          //console.log($scope.states);
          var index = findIndexInData(selectedCountries, 'id', item.id);
          selectedCountries.splice(index, 1);
          $scope.states = [];
         
          for (var i = 0; i < selectedCountries.length; i++) {
            var country = selectedCountries[i].id;
            $scope.countryDataResults.filter(function (obj) {
              if (obj.country === country && $scope.states.indexOf(obj.state) < 0 && obj.state != null) {
                $scope.states.push(obj.state); return obj;
              }
            });
          }
          // $scope.selectedStatesModel = [];
          // $scope.cities = [];
          if($scope.states.length <=0 || $scope.selectedStatesModel <=0 ){
            $scope.selectedStatesModel=[];
          }
          else{
            for(var j=0;j<$scope.states.length;j++){
              for(var k=0;k<$scope.selectedStatesModel.length;k++){
                      if($scope.states[j]===$scope.selectedStatesModel[k].id){
                        var models=[];
                        models.push({id:$scope.states[j]});
                        $scope.selectedStatesModel=[];
                        $scope.selectedStatesModel = models;
                      }
              }
            }
          }
          $scope.cities=[];
          for(var l=0;l<$scope.selectedStatesModel.length;l++){
            var state=$scope.selectedStatesModel[l].id;
            $scope.countryDataResults.filter(function(obj){ 
              if(obj.state===state && $scope.cities.indexOf(obj.city)<0 && obj.city != null){ 
                $scope.cities.push({id:obj.id,label:obj.city}); return obj; 
              } 
            }); 
          }
         
        }
      };

    $scope.onStateChange = {
      onItemSelect: function(stateObj){
        selectedStates.push(stateObj);
        for (var i=0; i< selectedStates.length; i++){
          var state = selectedStates[i].id;
          $scope.countryDataResults.filter(function(obj){ 
            if(obj.state===state && $scope.cities.indexOf(obj.city)<0 && obj.city != null){ 
              $scope.cities.push({id:obj.id,label:obj.city}); return obj; 
            } 
          });          
        }
        
      },
      onItemDeselect: function(item){
        var index = findIndexInData(selectedStates, 'id', item.id);
        selectedStates.splice(index, 1);
        $scope.cities = [];
        $scope.selectedCitiesModel = [];
        for (var i=0; i< selectedStates.length; i++){
          var state = selectedStates[i].id;
          $scope.countryDataResults.filter(function(obj){ 
            if(obj.state===state && $scope.cities.indexOf(obj.city)<0 && obj.city != null){ 
              $scope.cities.push({id:obj.id,label:obj.city}); return obj; 
            } 
          });          
        }
      }
    };
    function findIndexInData(data, property, value) {
      var result = -1;
      data.some(function (item, i) {
        if (item[property] === value) {
          result = i;
          return true;
        }
      });
      return result;
    }
    $scope.selectedStatesModel = [];
    $scope.stateDropdownSettings = {enableSearch: true, displayProp:'state'};

    $scope.selectedCitiesModel = [];
    $scope.cityDropdownSettings = {enableSearch: true};


    
  }]);


})();