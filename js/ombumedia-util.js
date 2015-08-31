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
          return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
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

(function($) {
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
    };
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
    };
  }

  /**
   * Returns the path to use in a Drupal-style `?destination=` url.
   */
  function destPath() {
    // Remove preceding slash '/'.
    return window.location.pathname.slice(1);
  }

  /**
   * Creates a file URL for the given file ID and action.
   */
  function fileUrl(fid, action) {
    var params = deparam(window.location.search.replace('?', ''));
    params.destination = destPath();
    return '/file/' + fid + '/' + action + '?' + $.param(params);
  }


  // Deparam (from string)
  //
  // Deserialize a params string into an object, optionally coercing numbers,
  // booleans, null and undefined values; this method is the counterpart to the
  // internal jQuery.param method.
  //
  // Usage:
  //
  // > deparam( params [, coerce ] );
  //
  // Arguments:
  //
  //  params - (String) A params string to be parsed.
  //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
  //    undefined to their actual value. Defaults to false if omitted.
  //
  // Returns:
  //
  //  (Object) An object representing the deserialized params string.

  function deparam( params, coerce ) {
    var obj = {},
      coerce_types = { 'true': !0, 'false': !1, 'null': null };

    // Iterate over all name=value pairs.
    $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
      var param = v.split( '=' ),
        key = decodeURIComponent( param[0] ),
        val,
        cur = obj,
        i = 0,

        // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
        // into its component parts.
        keys = key.split( '][' ),
        keys_last = keys.length - 1;

      // If the first keys part contains [ and the last ends with ], then []
      // are correctly balanced.
      if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
        // Remove the trailing ] from the last keys part.
        keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

        // Split first keys part into two parts on the [ and add them back onto
        // the beginning of the keys array.
        keys = keys.shift().split('[').concat( keys );

        keys_last = keys.length - 1;
      } else {
        // Basic 'foo' style key.
        keys_last = 0;
      }

      // Are we dealing with a name=value pair, or just a name?
      if ( param.length === 2 ) {
        val = decodeURIComponent( param[1] );

        // Coerce values.
        if ( coerce ) {
          val = val && !isNaN(val)            ? +val              // number
            : val === 'undefined'             ? undefined         // undefined
            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
            : val;                                                // string
        }

        if ( keys_last ) {
          // Complex key, build deep object structure based on a few rules:
          // * The 'cur' pointer starts at the object top-level.
          // * [] = array push (n is set to array length), [n] = array if n is
          //   numeric, otherwise object.
          // * If at the last keys part, set the value.
          // * For each keys part, if the current level is undefined create an
          //   object or array based on the type of the next keys part.
          // * Move the 'cur' pointer to the next level.
          // * Rinse & repeat.
          for ( ; i <= keys_last; i++ ) {
            key = keys[i] === '' ? cur.length : keys[i];
            cur = cur[key] = i < keys_last ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] ) : val;
          }

        } else {
          // Simple key, even simpler rules, since only scalars and shallow
          // arrays are allowed.

          if ( $.isArray( obj[key] ) ) {
            // val is already an array, so push on the next value.
            obj[key].push( val );

          } else if ( obj[key] !== undefined ) {
            // val isn't an array, but since a second value has been specified,
            // convert val into an array.
            obj[key] = [ obj[key], val ];

          } else {
            // val is a scalar.
            obj[key] = val;
          }
        }

      } else if ( key ) {
        // No value was defined, so set something meaningful.
        obj[key] = coerce ? undefined : '';
      }
    });

    return obj;
  }


  /**
   * Exports.
   */
  Drupal.ombumedia = Drupal.ombumedia || {};
  Drupal.ombumedia.util = Drupal.ombumedia.util || {
    supportsDragDrop: supportsDragDrop,
    supportsAjaxUpload: supportsAjaxUpload,
    preventDefaultWrapper: preventDefaultWrapper,
    stopPropagationWrapper: stopPropagationWrapper,
    destPath: destPath,
    fileUrl: fileUrl,
    deparam: deparam
  };

})(jQuery);
