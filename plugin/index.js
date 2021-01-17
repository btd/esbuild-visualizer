"use strict";

const fs = require("fs").promises;
const path = require("path");

const opn = require("open");

const TEMPLATE = require("./template-types");
const buildStats = require("./build-stats");

const { buildTree, mergeTrees, addLinks } = require("./data");

module.exports = async (opts) => {
  opts = opts || {};
  const filename = opts.filename || "stats.html";
  const title = opts.title || "EsBuild Visualizer";

  const open = !!opts.open;
  const openOptions = opts.openOptions || {};

  const { template = "treemap", include = [], exclude = [] } = opts;

  if (!TEMPLATE.includes(template)) {
    throw new Error(`Unknown template type ${template}. Known: ${TEMPLATE}`);
  }

  const roots = [];

  // collect trees
  for (const [id, bundle] of Object.entries(opts.metadata.outputs)) {
    if (exclude.some((r) => r.test(id)) && !include.some((r) => r.test(id)))
      continue;

    const modules = Object.entries(bundle.inputs);

    const tree = buildTree(id, modules);

    Object.assign(tree, {
      renderedLength: bundle.bytes,
      isRoot: true,
      name: id,
    });

    roots.push(tree);
  }

  const tree = mergeTrees(roots);

  const { nodes, links } = addLinks(opts.metadata);

  const data = {
    tree,
    links,
    nodes,
  };

  const fileContent = await buildStats({
    title,
    data,
    template,
  });

  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, fileContent);

  if (open) {
    return opn(filename, openOptions);
  }
};
