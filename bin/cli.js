#!/usr/bin/env node
"use strict";

const fs = require("fs").promises;
const globToRegexp = require("glob-to-regexp");

const warn = require("../plugin/warn");

const buildTemplate = require("../plugin/index");

const argv = require("yargs")
  .strict()

  .option("filename", {
    describe: "Output file name",
    string: true,
    default: "./stats.html",
  })
  .option("metadata", {
    describe: "Input file name",
    string: true,
    default: "./metadata.json",
  })
  .option("title", {
    describe: "Output file title",
    string: true,
    default: "EsBuild Visualizer",
  })
  .option("sourcemap", {
    describe: "Provided files is sourcemaps",
    boolean: true,
  })
  .option("include", {
    array: true,
    default: [],
    describe: "Include patterns",
  })
  .option("exclude", {
    array: true,
    default: [],
    describe: "Exclude patterns",
  })
  .help().argv;

const run = async ({
  title,
  template,
  metadata,
  filename,
  include,
  exclude,
}) => {
  const textContent = await fs.readFile(metadata, { encoding: "utf-8" });
  const jsonContent = JSON.parse(textContent);

  await buildTemplate({
    title,
    template,
    metadata: jsonContent,
    filename,
    include: include.map((p) => globToRegexp(p, { extended: true })),
    exclude: exclude.map((p) => globToRegexp(p, { extended: true })),
  });
};

run(argv).catch((err) => {
  warn(err.stack);
  process.exit(1);
});
