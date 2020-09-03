// directive.restrict = 'AE' (Both Attributes & Elements) /'A' (Only attribute) /'E' (Only element)
// directive.replace = true;
// directive.require: '^^myTabs';
// directive.templateUrl = 'url';
// directive.template = 'template html declarataions';
// directive.scope = {}; // Can be Isolate Scope, New Scope (Inherits prototypical from parent) or No New Scope (Equals parent scope)
// directive.scope.yourChoiceVariableName = '=attribute' --> <directive-name attribute="lol"></directive-name> //@,=,
// directive.transclude = true;
// directive.link = function(scope, element, attrs, controller, transcludeFn){};
// directive.controller = ['scope', function MyTabsController(scope) {}];
(function(){
    var app = angular.module('app');

    // Handsontable Base Directive
    app.directive('handsontableBase',['$location','$window','$injector','$timeout','HandsonApiAdapter',function($location,$window,$injector,$timeout,HandsonApiAdapter){
      var directive = {};
      directive.replace = true;
      directive.restrict = 'AE';
      directive.scope = false;  // Isolate scope
      directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-base.html';
      directive.link = function(scope, el, attr){
          scope.functions = {};
          scope.baseIsLoaded = false;
          // Assign Attributes
          if(attr.readOnly){
            scope.readOnly = attr.readOnly
          }else{
            scope.readOnly = false
          };
          if(attr.params){
            scope.params = JSON.parse(attr.params);
          };
          // defaults
          if(attr.height){
            scope.height = attr.height; 
          }else{
            scope.height = 500;  
          };
          if(attr.minRows){
            scope.minRows = attr.minRows;  
          }else{
            scope.minRows = 5;  
          };
          if(attr.excludeFields){
            scope.excludeFields = attr.excludeFields;  
          }else{
            scope.excludeFields = null;  
          };
          if(attr.includeFields){
            scope.includeFields = attr.includeFields;  
          }else{
            scope.includeFields = null;  
          };
          if(attr.pageSize){
            scope.pageSize = attr.pageSize;  
          }else{
            scope.pageSize = null;
          };
          if(attr.page){
            scope.page = attr.page;  
          }else{
            scope.page = null;
          };
          if(attr.gridOptions){
            // scope.gridOptions = JSON.parse(attr.gridOptions);
          }else{
            scope.gridOptions = null;
          }
          if(attr.filterType){
            scope.filterType = attr.filterType;
          }else{
            scope.filterType = null;
          }
          // Create Watchers
          // Re-render on change
          scope.apiService = $injector.get(attr.apiService); // This is given through HTML tag as api-service
          scope.baseIsLoaded = true;

          // Observation
          attr.$observe('params', function(val){
            scope.params = JSON.parse(val);
            if(scope.functions.length){
              scope.functions.render();
            }
          });
          
      };
      return directive;
    }]);

    // Handsontable API Service
    app.directive('handsontableApiService',['$location','$window','$injector','$timeout','HandsonApiAdapter','$stateParams',
    function($location,$window,$injector,$timeout,HandsonApiAdapter,$stateParams){
      var directive = {};
      directive.replace = false;
      directive.restrict = 'AE';
      directive.scope = false;  // No new scope
      var rental_period_types = [];
      
      directive.link = function(scope, el, attr){
        // JSON Parse
        //JSON.parse(scope.params);
        if(scope.apiService.getRentalPeriodTypes){
          scope.apiService.getRentalPeriodTypes().then(function(data){
            rental_period_types = data.data.results;
          });
        }
        scope.functions.render = function(){
          // 5 second delay for this call. This is to ensure that scrolling is smooth.
          console.log('Params: ' + scope.params);
          if($stateParams.rental){
            scope.params.stock_or_inventory = "Rental";
          }
          scope.isDataLoaded = false;
          $timeout(function() {
            scope.apiService.getSchema().then(function(schema){
              scope.schema = schema;
              console.log(scope.schema);
              scope.apiService.getOutput(scope.params).then(function(data){
                scope.count = data.data.count;
                scope.data = data.data.results;
                if($stateParams.rental){
                  scope.data = mapRentalPeriod(scope.data);
                }
                scope.isDataLoaded = true;
              });
            });
          }, 2000);
        };
        var mapRentalPeriod = function(records){
          records = records.map(function(item){
            if(item.stock_or_inventory==='Rental'){
              var types = rental_period_types.filter(function(type){ return type.id===item.rental_period;});
              if(types.length){
                item.rental_period = types[0].period_type;
                item.unit_price += ' '+item.rental_period;
              }else{
                item.rental_period = null;  
              }                
            }else{
              item.rental_period = null;
            }
            return item;
          });
          return records;
        };        
        // render first time
        scope.functions.render();        
      };
      return directive;
    }]);
    // Handsontable Settings Layer
    app.directive('handsontableSettings',['$location','$window','$injector','$timeout','HandsonApiAdapter',function($location,$window,$injector,$timeout,HandsonApiAdapter){
      var directive = {};
      directive.replace = false;
      directive.restrict = 'AE';
      directive.scope = false;  // No new scope
      directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-settings.html';
      directive.link = function(scope, el, attr){
        console.log(HandsonApiAdapter.generateColHeadersFromSchema(scope.schema.data,scope.excludeFields,scope.includeFields));

        scope.isSettingsLoaded = false;
        scope.settings = {
              // sortIndicator: true,
              colHeaders: HandsonApiAdapter.generateColHeadersFromSchema(scope.schema.data,scope.excludeFields,scope.includeFields),
              columns: HandsonApiAdapter.generateColInfoArrayFromSchema(scope.schema.data,true,scope.excludeFields,scope.includeFields), // True means ReadOnly
              minRows: scope.minRows,
              // renderAllRows: true,
              viewportRowRenderingOffset: 200,
              viewportColumnRenderingOffset: 30,
              //dropdownMenu: ['filter_by_value','filter_action_bar'],
              //filters: true,
              filters: false,
              height: scope.height,
              columnSorting: {
                column: 0,
                sortOrder: true, // true = ascending, false = descending, undefined = original order
                sortEmptyCells: false // true = the table sorts empty cells, false = the table moves all empty cells to the end of the table
              }
        };
        scope.isSettingsLoaded = true;
        if(scope.gridOptions){
          scope.gridOptions.data = scope.data;
        }
      };
      return directive;
    }]);   
})();
