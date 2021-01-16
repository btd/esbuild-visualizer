"use strict";

const buildTree = (modules) => {
  const tree = {
    name: "root",
    children: [],
    isRoot: true,
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
    isRoot: true,
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

const mergeSingleChildWithParent = (tree) => {
  const stack = [tree];
  while (stack.length !== 0) {
    const parent = stack.pop();
    if (parent.children != null) {
      if (parent.children.length === 1) {
        const child = parent.children[0];
        Object.assign(parent, child, {
          name: `${parent.name}/${child.name}`,
          children: child.children,
        });
        stack.push(parent);
      } else {
        for (const child of parent.children || []) {
          stack.push(child);
        }
      }
    }
  }
};

module.exports = {
  buildTree,
  mergeTrees,
  addLinks,
  mergeSingleChildWithParent,
};
