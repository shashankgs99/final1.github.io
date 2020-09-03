(function(Handsontable){
  var isImageListenerAdded = new WeakMap();
  function imageRenderer (instance, td, row, col, prop, value, cellProperties) {
    if(File.prototype.isPrototypeOf(value)){ // it's a file object
      var p = document.createElement("P");
      var t = document.createTextNode(value.name);
      p.appendChild(t);
      Handsontable.dom.empty(td);
      td.appendChild(p);
    }else{ // if it's not
      var img;
      var eventManager = registerEvents(instance); // register events like click, mouse-up and change

      function registerEvents(instance) { // Registering all events and handling the related functions down
        var eventManager = isImageListenerAdded.get(instance);
        if (!eventManager) {
          var eventManager = Handsontable.eventManager(this);
          eventManager.addEventListener(instance.rootElement, 'click', (function(event) {
            return onClick(event, instance);
          }));
          eventManager.addEventListener(instance.rootElement, 'mouseup', (function(event) {
            return onMouseUp(event, instance);
          }));
          eventManager.addEventListener(instance.rootElement, 'change', (function(event) {
            return onChange(event, instance);
          }));
          isImageListenerAdded.set(instance, eventManager);
        };
        function onMouseUp(event, instance) {}
        function onClick(event, instance) {
          if (cellProperties.readOnly) {
            event.preventDefault();
          }
        }
        function onChange(event, instance) {
          
          var row = parseInt(event.target.getAttribute('data-row'), 10);
          var col = parseInt(event.target.getAttribute('data-col'), 10);
          var cellProperties = instance.getCellMeta(row, col);
          if(event.target.files && event.target.files.length){
            instance.setDataAtCell(row, col, event.target.files[0]);
          }
        }
        return eventManager;
      };

      if (Handsontable.helper.stringify(value).indexOf('http') === 0) { // Handling Images View
        img = document.createElement('IMG');
        img.src = value;
        
        Handsontable.dom.addEvent(img, 'mousedown', function (e){
          e.preventDefault(); // prevent selection quirk
        });

        Handsontable.dom.empty(td);
        td.appendChild(img);
      }else {
        // Add a button here to upload file. This should talk to angular this is the main thing
        var div = document.createElement("DIV");
        document.body.appendChild(div);
        
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("class", "na");
        input.setAttribute('data-row', row);
        input.setAttribute('data-col', col);
        div.appendChild(input);

        Handsontable.dom.addEvent(div, 'mousedown', function (e){
          e.preventDefault(); // prevent selection quirk
        });
        Handsontable.dom.empty(td);
        td.appendChild(div);
      }
    };
    return td;
  };

  var imageEditor = Handsontable.editors.CheckboxEditor.prototype.extend();
  imageEditor.prototype.beginEditing = function (initialValue, event) {};

  // Register an alias
  Handsontable.editors.registerEditor('my.img.editor', imageEditor);
  Handsontable.renderers.registerRenderer('my.img.renderer', imageRenderer);


})(Handsontable);