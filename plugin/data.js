"use strict";

const path = require("path");

const buildTree = (modules) => {
  let tree = {
    name: "root",
    children: [],
  };

  for (const [id, { bytesInOutput }] of modules) {
    const name = id;

    const nodeData = { id, renderedLength: bytesInOutput };

    addToPath(tree, name.split("/"), nodeData);
  }

  return tree;
};

// ugly but works for now
function addToPath(tree, p, value) {
  if (p[0] === "") {
    p.shift();
  }

  let child = tree.children.find((c) => c.name === p[0]);
  if (child == null) {
    child = {
      name: p[0],
      children: [],
    };
    tree.children.push(child);
  }
  if (p.length === 1) {
    Object.assign(child, value);
    delete child.children;
    return;
  }
  p.shift();
  addToPath(child, p, value);
}

const mergeTrees = (trees) => {
  if (trees.length === 1) {
    return trees[0];
  }
  const newTree = {
    name: "root",
    children: trees,
  };

  return newTree;
};

const addLinks = (inputEntries, links) => {
  for (const [inputId, { imports }] of inputEntries) {
    for (const { path } of imports) {
      links.push({ source: inputId, target: path });
    }
  }
};

const skipModule = (id) => !path.isAbsolute(id);

const removeCommonPrefix = (nodes, nodeIds) => {
  let commonPrefix = null;

  for (const [id, uid] of Object.entries(nodeIds)) {
    const node = nodes[uid];

    if (!skipModule(id, node)) {
      if (commonPrefix == null) {
        commonPrefix = id;
      }

      for (let i = 0; i < commonPrefix.length && i < id.length; i++) {
        if (commonPrefix[i] !== id[i]) {
          commonPrefix = commonPrefix.slice(0, i);
          break;
        }
      }
    }
  }

  const commonPrefixLength = commonPrefix.length;
  for (const [id, uid] of Object.entries(nodeIds)) {
    const node = nodes[uid];
    if (!skipModule(id, node)) {
      const newId = id.slice(commonPrefixLength);
      const value = nodeIds[id];
      delete nodeIds[id];
      nodeIds[newId] = value;
    }
  }
};

module.exports = { buildTree, mergeTrees, addLinks, removeCommonPrefix };
