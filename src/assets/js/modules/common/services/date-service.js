angular.module('app').factory('dateService',function($log) {
    
        var dateService = {
            convertDateToPython: convertDateToPython,
            convertDateToJS: convertDateToJS
        };
    
        return dateService;
    
        function convertDateToPython(dateInput){
            function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(dateInput);
            return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }
    
        function convertDateToJS(dateInput){
            if(dateInput){
                var from = dateInput.split("/");
                return new Date(from[2], from[1] - 1, from[0]);
            }else{
                return null;
            }
        }
    });