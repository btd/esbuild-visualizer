#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

import opn from "open";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import TEMPLATE, { TemplateType } from "../plugin/template-types";
import { warn } from "../plugin/warn";
import { Metadata } from "../types/metafile";
import { visualizer } from "../plugin/index";

const argv = yargs(hideBin(process.argv))
  .option("filename", {
    describe: "Output file name",
    type: "string",
    default: "./stats.html",
  })
  .option("title", {
    describe: "Output file title",
    type: "string",
    default: "EsBuild Visualizer",
  })
  .option("template", {
    describe: "Template type",
    type: "string",
    choices: TEMPLATE,
    default: "treemap" as TemplateType,
  })
  .option("metadata", {
    describe: "Input file name",
    string: true,
    default: "./metadata.json",
  })
  .option("open", {
    describe: "Open file in browser",
    boolean: true,
    default: false,
  })
  .help().argv;

interface CliArgs {
  filename: string;
  title: string;
  template: TemplateType;
  metadata: string;
  open: boolean;
}

const run = async (args: CliArgs) => {
  const textContent = await fs.readFile(args.metadata, { encoding: "utf-8" });
  const jsonContent = JSON.parse(textContent) as Metadata;

  const fileContent = await visualizer(jsonContent, {
    title: args.title,
    template: args.template,
  });

  await fs.mkdir(path.dirname(args.filename), { recursive: true });
  await fs.writeFile(args.filename, fileContent);

  if (args.open) {
    await opn(args.filename);
  }
};

run(argv).catch((err: Error) => {
  warn(err.stack);
  process.exit(1);
});
