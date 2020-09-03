(function(Handsontable){
  

  function manyToManyRenderer (instance, td, row, col, prop, value, cellProperties){
    
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    return td;
  }

  var manyToManyEditor = Handsontable.editors.AutocompleteEditor.prototype.extend();
  
  manyToManyEditor.prototype.finishEditing = function(restoreOriginalValue, ctrlDown, callback) {
    
    // Modify certain part of it
    if (this.htEditor && this.htEditor.getSelected()) {
      var value = this.htEditor.getInstance().getValue();
      var valuesArray = [];
      if (value !== void 0) {
        valuesArray.push(value);
        console.log(valuesArray);
        this.setValue(valuesArray);
        console.log(this.row);
        console.log(this.col);

      }
    }
    // Call the original finish Editing
    var _this = this,
      val;
    if (this.isWaiting()) {
      return;
    }
    if (this.state == Handsontable.EditorState.VIRGIN) {
      this.instance._registerTimeout(setTimeout(function() {
        _this._fireCallbacks(true);
      }, 0));
      return;
    }
    if (this.state == Handsontable.EditorState.EDITING) {
      if (restoreOriginalValue) {
        this.cancelChanges();
        this.instance.view.render();
        return;
      }
      var value = this.getValue();
      if (this.instance.getSettings().trimWhitespace) {
        val = [[typeof value === 'string' ? String.prototype.trim.call(value || '') : value]];
      } else {
        val = [[value]];
      }
      this.state = Handsontable.EditorState.WAITING;
      this.saveValue(val, ctrlDown);
      if (this.instance.getCellValidator(this.cellProperties)) {
        this.instance.addHookOnce('postAfterValidate', function(result) {
          _this.state = Handsontable.EditorState.FINISHED;
          _this.discardEditor(result);
        });
      } else {
        this.state = Handsontable.EditorState.FINISHED;
        this.discardEditor(true);
      }
    }
  };

  Handsontable.editors.registerEditor('my.manyToMany.editor', manyToManyEditor);
  Handsontable.renderers.registerRenderer('my.manyToMany.renderer', manyToManyRenderer);

})(Handsontable);