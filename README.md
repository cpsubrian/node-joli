joli
====

Pretty-up those JSON objects.

[![build status](https://secure.travis-ci.org/cpsubrian/node-joli.png)](http://travis-ci.org/cpsubrian/node-joli)

Example
-------

```js

var joli = require('joli');

var data = [
  {type: 'movie', title: 'Avatar'},
  {type: 'song', title: 'Master of Puppets'},
  {type: 'movie', title: 'Ghostbusters'},
  {type: 'movie', title: 'Jurrasic Park'},
  {type: 'song', title: 'Rolling in the Deep'}
];

var style = {
  filter: function (data) {
    return data.type === 'movie';
  },
  map: function (data) {
    return data.title;
  }
};

/**
 * Using the functional interface
 */

var styled = joli.style(data, style);

console.log(styled);

// Will output:
//
// [ 'Avatar', 'Ghostbusters', 'Jurrasic Park' ]


/**
 * Using the streaming interface.
 */

var stream = joli.stream({style: style});

stream.on('data', function (data) {
  console.log(data);
});

// Mix and match objects and JSON.
stream.write('{ "type": "movie", "title": "Avatar" }');
stream.write({ type: 'song', title: 'Rolling in the Deep' });
stream.write({ type: 'movie', title: 'Jurrasic Park' });

// Will have outputted:
//
// Avatar
// Jurrasic Park

```

API
---

### joli.style (data, style)

Style an object or array of objects by passing them through filter, map, and
reduce functions. Returns the modified results.

`data` should be an object or array of objects.

`style` should be a style 'hash' or a 'named' style.

See **Styles** below.

### joli.stream (options)

Returns

Styles
------


Outputters
----------


joli(1)
-------

Install with `npm install -g joli`.

```
$ joli --help

  Usage: joli [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -n, --newline        use if input is newline-separated JSON objects
    -l, --lines          output results line-by-line (enables newline mode)
    -f, --filter <fn>    use the given <fn> for filtering
    -m, --map <fn>       use the given <fn> for mapping
    -r, --reduce <fn>    use the given <fn> for reducing. Disabled by --lines.
    -s, --style <name>   use the <name> style
    -o, --output <name>  use the <name> outputter
```

The joli CLI is inspired by [jog](https://github.com/visionmedia/jog), but is
specialized for working with stdin/stdout and supports using joli's 'styles'
and 'outputters'.

**Functions**

When using `--map`, `--filter`, or `--reduce` you are essentialy creating
functions on the command line.

Consider:

```
$ joli --map "_.name === 'Brian'"
```

Has the the eventual effect of:

```js
data = data.filter(function( _ ) {
  return _.name === 'Brian';
});
```

Both `--map` and `--filter` can reference `_`.

`--reduce` is a little special because with it you can reference:

- `$` - prev value
- `_` - current value
- `i` - index
- `a` - the whole array of data objects

**Examples**

View a json file with the 'inspect' outputter:

```
$ cat package.json | joli -o inspect
{ name: 'joli',
  version: '0.0.3',
  description: 'Pretty-up those JSON objects.',
  main: 'index.js',
  dependencies:
   { through: '~1.1.1',
     split: '0.1.0',
     commander: '~1.0.5' },
  devDependencies: { mocha: '*' },
  scripts: { test: 'make test' },
  bin: { joli: './bin/joli' },
  repository:
   { type: 'git',
     url: 'git://github.com/cpsubrian/node-joli.git' },
  homepage: 'https://github.com/cpsubrian/node-joli',
  keywords: [ 'json', 'pretty', 'cli' ],
  author: 'Brian Link <cpsubrian@gmail.com>',
  license: 'MIT' }
```

View a json file with the 'keys' style:

```
$ cat package.json | joli -s keys
[ 'name',
  'version',
  'description',
  'main',
  'dependencies',
  'devDependencies',
  'scripts',
  'bin',
  'repository',
  'homepage',
  'keywords',
  'author',
  'license' ]
```

View a json file with the 'values' style:

```
$ cat package.json | joli -s values
[ 'joli',
  '0.0.3',
  'Pretty-up those JSON objects.',
  'index.js',
  { through: '~1.1.1', split: '0.1.0', commander: '~1.0.5' },
  { mocha: '*' },
  { test: 'make test' },
  { joli: './bin/joli' },
  { type: 'git', url: 'git://github.com/cpsubrian/node-joli.git' },
  'https://github.com/cpsubrian/node-joli',
  [ 'json', 'pretty', 'cli' ],
  'Brian Link <cpsubrian@gmail.com>',
  'MIT' ]
```

View a json file with a custom map function:

```
$ cat package.json | joli --map "'name: ' + _.name + '\nversion: ' + _.version"
name: joli
version: 0.0.3
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT

- Copyright (C) 2012 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.