(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    function stringCount(haystack, needle) {
      if (!needle || !haystack) {
          return false;
      }
      else {
          var words = haystack.split(needle);
          return words.length;
      }
    }
  
    app.factory('ParentCategoryAdapter',[function(){
      
      var factory = {};
      // Handling classification of subcategories present in PARENT CATEGORIES REQUEST
      factory.classifySubCategories = function(parent_categories){
        for(var i=0;i<parent_categories.length;i++){
          parent_categories[i].sub_category = [];
          for(var j=0;j<parent_categories[i].categories.length;j++){
            try{
              if(stringCount(parent_categories[i].categories[j],"-")==2){
                parent_categories[i]
                  .sub_category.push({
                    name : parent_categories[i].categories[j],
                    sub_sub_category : []
                  })
              }else if(stringCount(parent_categories[i].categories[j],"-")==3){
                //classfiy as sub-sub-category
                parent_categories[i]
                  .sub_category.slice(-1)[0] 
                  .sub_sub_category.push({
                    name : parent_categories[i].categories[j],
                    sub_sub_sub_category : []
                  })
              }
              else if(stringCount(parent_categories[i].categories[j],"-")>=4){
                //classfiy as sub-sub-sub-category
                parent_categories[i]
                  .sub_category.slice(-1)[0]
                  .sub_sub_category.slice(-1)[0]
                  .sub_sub_sub_category.push({
                    name : parent_categories[i].categories[j]
                  })
              }
            }
            catch(err){
              console.log(err);
            }
          }
        }
        console.log(parent_categories);
        return parent_categories;
      }
      
  
      return factory;
    }]);
  })();