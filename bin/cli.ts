#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

import opn from "open";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import TEMPLATE, { TemplateType } from "../plugin/template-types";
import { warn } from "../plugin/warn";
import { Metadata } from "../types/metafile";
import { visualizer } from "../plugin/index";
import { version } from "../plugin/version";
import { ModuleMeta, ModulePart, ModuleTree, ModuleUID, VisualizerData } from "../shared/types";
import { renderTemplate } from "../plugin/render-template";

const argv = yargs(hideBin(process.argv))
  .strict()
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
    array: true,
    default: ["./metadata.json"],
  })
  .option("open", {
    describe: "Open file in browser",
    boolean: true,
    default: false,
  })
  .help()
  .parseSync();

interface CliArgs {
  filename: string;
  title: string;
  template: TemplateType;
  metadata: string[];
  open: boolean;
}

const run = async (args: CliArgs) => {
  if (args.metadata.length === 0) {
    throw new Error("Empty file list");
  }

  const fileContents = await Promise.all(
    args.metadata.map(async (file) => {
      const textContent = await fs.readFile(file, { encoding: "utf-8" });
      const jsonContent = JSON.parse(textContent) as Metadata;

      const data = visualizer(jsonContent);

      return { file, data };
    })
  );

  const tree: ModuleTree = {
    name: "root",
    children: [],
  };
  const nodeParts: Record<ModuleUID, ModulePart> = {};
  const nodeMetas: Record<ModuleUID, ModuleMeta> = {};

  for (const { file, data } of fileContents) {
    if (data.version !== version) {
      warn(`Version in ${file} is not supported (${data.version}). Current version ${version}. Skipping...`);
      continue;
    }

    if (data.tree.name === "root") {
      tree.children = tree.children.concat(data.tree.children);
    } else {
      tree.children.push(data.tree);
    }

    Object.assign(nodeParts, data.nodeParts);
    Object.assign(nodeMetas, data.nodeMetas);
  }

  const title = args.title ?? "EsBuild Visualizer";

  const template = args.template ?? "treemap";

  const data: VisualizerData = {
    version,
    tree,
    nodeParts,
    nodeMetas,
    env: {},
    options: { gzip: false, brotli: false, sourcemap: false },
  };

  const fileContent: string = await renderTemplate(template, {
    title,
    data,
  });

  await fs.mkdir(path.dirname(args.filename), { recursive: true });
  await fs.writeFile(args.filename, fileContent);

  if (args.open) {
    await opn(args.filename);
  }
};

run(argv as CliArgs).catch((err: Error) => {
  warn(err.stack);
  process.exit(1);
});
