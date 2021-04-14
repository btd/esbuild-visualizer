# EsBuild Visualizer

[![NPM Version](https://img.shields.io/npm/v/esbuild-visualizer.svg)](https://npmjs.org/package/esbuild-visualizer) [![Travis CI build status](https://img.shields.io/travis/com/btd/esbuild-visualizer.svg)](https://travis-ci.com/btd/esbuild-visualizer)

Visualize and analyze your esbuild bundle to see which modules are taking up space.
## Installation

```sh
npm install --save-dev esbuild-visualizer
```

or via yarn:

```sh
yarn add --dev esbuild-visualizer
```

## Usage

Add script to package.json for example:
```sh
esbuild-visualizer --metadata ./meta.json --exclude *.png

```

## Options

`--filename` (string, default `stats.html`) - name of the file with diagram to generate

`--title` (string, default `Esbuild Visualizer`) - title tag value

`--template` (string, default `treemap`) - diagram type to use, could be sunburst, treemap, network

## Disclaimer about generated files

Generated html files do not and never will contain your source code (contents of files). They can contain only js/html/css code required to build chart (plugin code) and statistical information about your source code.

This statistical information can contain:

- size of files included in bundle
- size of files included in source map
- file's path
- files hierarchy (fs tree for your files)

## Upgrades

See CHANGELOG.md.
