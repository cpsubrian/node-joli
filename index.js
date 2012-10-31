var fs = require('fs')
  , path = require('path')
  , existsSync = fs.existsSync || path.existsSync;

/**
 * Exposes both functional and streaming interfaces.
 *
 * Data is expected to be JSON containing either a
 * single object to be formatted, or an array of
 * objects.
 */

exports.style = function(data, style) {
  if (typeof style === 'string') {
    if (!exports.styles[style]) throw new Error('Style `' + style + '` not found');
    style = exports.styles[style];
  }

  // Filter the data.
  if (style.filter) {
    if (Array.isArray(data)) {
      data = data.filter(style.filter);
    }
    else if (!style.filter(data)) {
      data = null;
    }
  }

  // Reduce the data.
  if (style.reduce) {
    if (Array.isArray(data)) {
      if (style.reduceInitialValue) {
        data = data.reduce(style.reduce, style.reduceInitialValue);
      }
      else {
        data = data.reduce(style.reduce);
      }
    }
  }

  // Map the data.
  if (style.map) {
    if (Array.isArray(data)) {
      data = data.map(style.map);
    }
    else {
      data = style.map(data);
    }
  }

  return data;
};

exports.stream = function (options) {
  return require('through')(
    function write (data) {
      var parsed = JSON.parse(data);
      var styled = exports.style(parsed);
      var out = options.json ? JSON.stringify(styled, null, 2) : styled;
      this.emit('data', out);
    },
    function end () {
      this.emit('end');
    }
  );
};

/**
 * Styles can be saved and reused. They can be loaded from the following
 * locations (and override eachother in this order):
 *
 * - $HOME/.joli/styles/*.js
 * - $CWD/.joli/styles/*.js
 *
 * A style is a node module that exports an object containing one or
 * more of:
 *
 * - **filter** `function(data)` - A filter function to run on the data.
 * - **reduce** `function(data, [initialValue])` - A reduce function to run
 *   on the data.
 * - **reduceInitialValue** - A value to pass as the initial value for the
 *   reduce operation.
 * - **map** `function(data)` - A map function to run on the data.
 *
 * Note: **reduce** will only effect arrays of objects, not single objects.
 *
 * The name of the style will be determined by its filename.
 */
var styles = null;
exports.styles = function () {
  if (!styles) {
    styles = {};

    // Load core styles.
    fs.readdirSync(path.join(__dirname, 'styles')).forEach(function(file) {
      if (file.match(/\.js$/)) {
        styles[file.slice(0, -3)] = require(path.join(__dirname, 'styles', file));
      }
    });

    // Load styles relative to HOME.
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var homePath = path.join(home, '.jog', 'styles');
    if (existsSync(homePath)) {
      fs.readdirSync(homePath).forEach(function(file) {
        if (file.match(/\.js$/)) {
          styles[file.slice(0, -3)] = require(path.join(homePath, file));
        }
      });
    }

    // Load styles relative to CWD.
    var cwdPath = path.join(process.cwd(), '.jog', 'styles');
    if (existsSync(cwdPath)) {
      fs.readdirSync(cwdPath).forEach(function(file) {
        if (file.match(/\.js$/)) {
          styles[file.slice(0, -3)] = require(path.join(cwdPath, file));
        }
      });
    }
  }
  return styles;
};

/**
 * Outputters can be saved and reused.  They can be loaded from the following
 * locations (and override eachother in this order).
 *
 * - $HOME/.joli/outputters/*.js
 * - $CWD/.joli/outputters/*.js
 *
 * An outputter is a node module that exports a function that accepts data
 * and outputs it somewhere.
 *
 * The default 'console' outputter is available and just console.log's the
 * data.
 */
var outputters = null;
exports.outputters = function () {
  if (!outputters) {
    outputters = {};

    // Load core outputters.
    fs.readdirSync(path.join(__dirname, 'outputters')).forEach(function(file) {
      if (file.match(/\.js$/)) {
        outputters[file.slice(0, -3)] = require(path.join(__dirname, 'outputters', file));
      }
    });

    // Load outputters relative to HOME.
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var homePath = path.join(home, '.jog', 'outputters');
    if (existsSync(homePath)) {
      fs.readdirSync(homePath).forEach(function(file) {
        if (file.match(/\.js$/)) {
          outputters[file.slice(0, -3)] = require(path.join(homePath, file));
        }
      });
    }

    // Load outputters relative to CWD.
    var cwdPath = path.join(process.cwd(), '.jog', 'outputters');
    if (existsSync(cwdPath)) {
      fs.readdirSync(cwdPath).forEach(function(file) {
        if (file.match(/\.js$/)) {
          outputters[file.slice(0, -3)] = require(path.join(cwdPath, file));
        }
      });
    }
  }
  return outputters;
};



