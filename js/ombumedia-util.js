/**
 * Polyfills.
 */

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if (typeof Object.create != 'function') {
  // Production steps of ECMA-262, Edition 5, 15.2.3.5
  // Reference: http://es5.github.io/#x15.2.3.5
  Object.create = (function() {
    function Temp() {}
    var hasOwn = Object.prototype.hasOwnProperty;
    return function (O) {
      if (typeof O != 'object') {
        throw TypeError('Object prototype may only be an Object or null');
      }
      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null;
      if (arguments.length > 1) {
        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }
      return obj;
    };
  })();
}


/**
 * Utilities.
 */

(function() {
"use strict";

  var supportsDragDrop = (function() {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  });

  var supportsAjaxUpload = (function() {
    var xhr = new XMLHttpRequest();
    return !!(xhr && ('upload' in xhr));
  });

  /**
   * Wraps an event based callback function to call preventDefault().
   */
  function preventDefaultWrapper(fn) {
    return function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      fn.apply(this, arguments);
    } 
  }

  /**
   * Wraps an event based callback function to call stopPropagation().
   */
  function stopPropagationWrapper(fn) {
    return function(e) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      fn.apply(this, arguments);
    } 
  }

  /**
   * Exports.
   */
  Drupal.ombumedia = Drupal.ombumedia || {};
  Drupal.ombumedia.util = Drupal.ombumedia.util || {
    supportsDragDrop: supportsDragDrop,
    supportsAjaxUpload: supportsAjaxUpload,
    preventDefaultWrapper: preventDefaultWrapper,
    stopPropagationWrapper: stopPropagationWrapper
  };

})();
