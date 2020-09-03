# ngSelect
An AngularJS module that transforms any HTML element on the page to selectable components.

#### [Demo](http://plnkr.co/edit/4neUeA?p=preview)

## Requirements
AngularJS v1.0.1+

## Getting started
Include the ngSelect module with AngularJS script in your page.
```html
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
<script src="http://pc035860.github.io/ngSelect/ngSelect.min.js"></script>
```

Add `ngSelect` to your app module's dependency.
```js
angular.module('myApp', ['ngSelect']);
```

## Install with Bower

The official bower package of AngularJS hasn't support unstable branch, hence for the current version of `ngSelect` package, no dependency is specified.

```sh
# install AngularJS (stable)
bower install angular
# or (unstable)
bower install PatternConsulting/bower-angular

# install ngSelect
bower install ngSelect
```

## Usage

### ng-select
Require directive: `ngModel` (means there must be an `ng-model` directive at the same element)
Type: `boolean`
Default: `undefined`

Enables selection logic for model in `ngModel`

[Live Example](http://pc035860.github.io/ngSelect/example/#/ng-select)
```html
<!-- setup selection display/input input:text -->
<p class="lead">
  selection: <input type="text" ng-model="selection">
</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<div class="row example" ng-select ng-model="selection">
  <div class="span12">

    <!-- five images with number as option value -->
    <!-- add "selected" class on option selected -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num"
         select-class="{'selected': $optSelected}">
  </div>
</div>
```

### ng-select-option
Require directive: `^ng-select` (means there must be an `ng-select` in parent elements)

Type: `expression`
Default: `undefined`

Provides selection value for the model specified in `ng-select`.
Special properties are exposed on the local scope of each `ng-select-option` instance, can be used in the evaluation of `select-class`, `select-style`, `select-disabled` expressions.
* `$optIndex` - {number} - unique index of the option
* `$optValue` - {*} - value of the option
* `$optSelected` - {boolean} - whether the option is selected
* `$optDisabled` - {boolean} - whether the option is disabled

#### select-class (optional)
Require directive: `ng-select` or `ng-select-option`

Type: `expression`
Default: `undefined`

Provides the exact same functionality as <code>ng-class</code>, but with the additional local scope applied with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is applicable to `ng-select` as global configuration and also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-class)
```html
<!-- display of selection -->
<p class="lead">selection: {{ selection }}</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<!-- add "selected" class on option selected -->
<div class="row example"
     ng-select ng-model="selection"
     select-class="{'selected': $optSelected}">

  <div class="span12">

    <!-- five images with number as option value -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num">
  </div>
</div>
```

#### select-style (optional)
Require directive: `ng-select` or `ng-select-option`

Type: `expression`
Default: `undefined`

Provides the exact same functionality as <code>ng-style</code>, but with the additional local scope applied with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is applicable to `ng-select` as global configuration and also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-style)
```html
<!-- display of selection -->
<p class="lead">selection: {{ selection }}</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<!-- style the options' opacity with their value -->
<div class="row example"
     ng-select ng-model="selection"
     select-style="{'opacity': 0.2 * $optValue}">

  <div class="span12">

    <!-- five images with number as option value -->
    <!-- add "selected" class on option selected -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num"
         select-class="{'selected': $optSelected}">
  </div>
</div>
```

#### select-disabled (optional)
Require directive: `ng-select` or `ng-select-option`

Type: `expression`
Default: `undefined`

Disables the interactivity of options if the expression is evaluated to be `true`. The evaluation has the access to the additional local scope with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is applicable to `ng-select` as global configuration and also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-disabled)
```html
<p class="lead">
  <!-- display of selection -->
  selection: {{ selection }}

  <!-- button for enabling select behavior -->
  <button class="btn btn-danger btn-large"
          ng-show="!disabled" ng-click="disabled = true">disable</button>

  <!-- button for disabling select behavior -->
  <button class="btn btn-success btn-large"
          ng-show="disabled" ng-click="disabled = false">enable</button>
</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<!-- the thrid and fifth options are always disabled -->
<!-- all options are disabled when scope.disabled == true -->
<div class="row example"
     ng-select ng-model="selection"
     select-disabled="disabled || ($optIndex == 2 || $optIndex == 4)">

  <div class="span12">

    <!-- five images with number as option value -->
    <!-- add "selected" class on selected option and "disabled" class on disabled option -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num"
         select-class="{'selected': $optSelected, 'disabled':$optDisabled}">
  </div>
</div>
```

#### select-multiple (optional)
Require directive: `ng-select`

Type: `boolean`
Default: `false`

Enables `ng-select` to support multiple selection, of which the model binded will be an array. This optional directive is only applicable to `ng-select`.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-multiple)
```html
<!-- display of selection -->
<p class="lead">selection: {{ selection }}</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<!-- add "selected" class on option selected -->
<!-- enable multiple selection -->
<div class="row example multiple"
     ng-select ng-model="selection"
     select-class="{'selected': $optSelected}"
     select-multiple>

  <div class="span12">

    <!-- five images with number as option value -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num">
  </div>
</div>
```

#### Example usage with ngModel validations

[Live Example](http://pc035860.github.io/ngSelect/example/#/with-ngModel-validation)
```html
<!-- display of selection -->
<p class="lead">selection: {{ selection }}</p>

<!-- bind scope.selection to ngModel and enable ngSelect -->
<!-- set custom validation to match only odd values -->
<div class="row example"
     ng-select ng-model="selection"
     example-odd>

  <div class="span12">

    <!-- five images with number as option value -->
    <!-- add "selected" class on option selected -->
    <img class="img-polaroid img-circle"
         ng-repeat="num in [1, 2, 3, 4, 5]"
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}"
         ng-select-option="num"
         select-class="{'selected': $optSelected}">
  </div>
</div>
```

Custom validator source code: (see [Angular forms manual](http://docs.angularjs.org/guide/forms) for explanations.)
```javascript
angular.module('exampleApp').directive('exampleOdd', function(){
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ngModelCtrl) {
      ngModelCtrl.$parsers.push(function(viewValue) {
        if (parseInt(viewValue) % 2 == 0) {
          ngModelCtrl.$setValidity('exampleOdd', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('exampleOdd', true);
          return viewValue;
        }
      });
      ngModelCtrl.$formatters.push(function(modelValue) {
        if (modelValue % 2 == 0) {
          ngModelCtrl.$setValidity('exampleOdd', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('exampleOdd', true);
          return modelValue;
        }
      });
    }
  }
});
```

## Note

1. Duplicate values in `ng-select-option` will cause strange behavior.

## More demos

#### [Dynamic-valued option](http://plnkr.co/edit/0SEzEQ?p=preview)
`ng-select-option` values can be changed dynamically, and stay binded with `ng-select` model. Try it by selecting the `Other` option in the demo and enter something in the text input.

#### [Angular-highlightjs demo (feat. ngSelect)](http://plnkr.co/edit/OPxzDu?p=preview)
Super easy tab implementation with `ngSelect`.
