# EsBuild Visualizer

[![NPM Version](https://img.shields.io/npm/v/esbuild-visualizer.svg)](https://npmjs.org/package/esbuild-visualizer) [![Travis CI build status](https://img.shields.io/travis/com/btd/esbuild-visualizer.svg)](https://travis-ci.com/btd/esbuild-visualizer)

Visualize and analyze your Rollup bundle to see which modules are taking up space.

## Screenshots

![pic](https://github.com/btd/esbuild-visualizer/blob/master/pics/collage.png?raw=true)

## Installation

```sh
npm install --save-dev esbuild-visualizer
```

or via yarn:

```sh
yarn add --dev esbuild-visualizer
```

## Usage

```sh
./node_modules/.bin/esbuild-visualizer --metadata ./meta.json --exclude *.png

```

## Options

`filename` (string, default `stats.html`) - name of the file with diagram to generate

`title` (string, default `Rollup Visualizer`) - title tag value

`sourcemap` (boolean, default `false`) - Use sourcemaps to calculate sizes (e.g. after UglifyJs or Terser)

`open` (boolean, default `false`) - Open generated file in default user agent

`template` (string, default `treemap`) - Which digram type to use: `sunburst`, `treemap`, `network` (very early stage, feedback welcomed)

`json` (boolean, default `false`) - Product portable json file that can be used with plugin CLI util to generate graph from several json files. Every UI property ignored in this case.

`gzipSize` (boolean, default `false`) - Collect gzip size from source code and display it at chart

`brotliSize` (boolean, default `false`) - Collect brolti size from source code and display it at chart. Only if current node version supports it

## Disclaimer about generated files

Generated html files do not and never will contain your source code (contents of files). They can contain only js/html/css code required to build chart (plugin code) and statistical information about your source code.

This statistical information can contain:

- size of files included in bundle
- size of files included in source map
- file's path
- files hierarchy (fs tree for your files)

## Upgrades

See CHANGELOG.md.
