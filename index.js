var fs = require('fs')
  , path = require('path')
  , existsSync = fs.existsSync || path.existsSync
  , cache = {};

/**
 * Exposes both functional and streaming interfaces.
 *
 * Data is expected to be JSON containing either a
 * single object to be formatted, or an array of
 * objects.
 */

exports.style = function(data, style) {
  // Accepts array of styles.
  if (Array.isArray(style)) {
    style.forEach(function (style) {
      data = exports.style(data, style);
    });
    return data;
  }

  // Accepts style name.
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
      return null;
    }
  }

  // Reduce the data, if data is an array.
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
      if (typeof data === 'string') {
        data = exports.parse(data);
      }
      if (data && options.style) {
        data = exports.style(data, options.style);
      }
      if (data && options.json) {
        data = JSON.stringify(data, null, 2);
      }
      if (data) {
        this.emit('data', data);
      }
    },
    function end () {
      this.emit('end');
    }
  );
};

exports.parse = function (data, fail) {
  try {
    return JSON.parse(data);
  }
  catch (e) {
    if (fail) {
      throw e;
    }
    else {
      // Valid JSON might be surrounded by stuff, try to parse it out.
      var match = data.match(/\{.*\}/);
      if (match) {
        var parsed = exports.parse(match[0], true);
        parsed._extra = data.split(match[0]);
        return parsed;
      }
      // Wrap non-JSON data.
      else {
        return {text: data};
      }
    }
  }
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
exports.styles = loadModules.call(this, 'styles');

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
exports.outputters = loadModules.call(this, 'outputters');

/**
 * Loads modules in the joli fallback paths.
 */
function loadModules (type) {
  if (!cache[type]) {
    cache[type] = {};

    // Load core modules.
    loadFiles(type, __dirname);

    // Load outputters relative to HOME.
    loadFiles(type, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

    // Load outputters relative to CWD.
    loadFiles(type, process.cwd());
  }
  return cache[type];
}
function loadFiles (type, root) {
  var dir = path.join(root, '.joli', type);
  if (existsSync(dir)) {
    fs.readdirSync(dir).forEach(function(file) {
      if (file.match(/\.js$/)) {
        cache[type][file.slice(0, -3)] = require(path.join(dir, file));
      }
    });
  }
}
