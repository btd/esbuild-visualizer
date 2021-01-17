"use strict";

const buildTree = (id, modules) => {
  const tree = {
    name: id,
    children: [],
    isRoot: true,
  };

  for (const [moduleId, { bytesInOutput }] of modules) {
    const name = moduleId;

    const nodeData = {
      id: moduleId,
      uid: `${id}-${moduleId}`,
      renderedLength: bytesInOutput,
    };

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

const addLinks = ({ inputs, outputs }) => {
  const nodes = {};
  const links = [];
  for (const [outputModuleId, outputModule] of Object.entries(outputs)) {
    for (const [moduleId, { bytesInOutput }] of Object.entries(outputModule.inputs)) {
      const { imports } = inputs[moduleId];
      const uid = `${outputModuleId}-${moduleId}`;
      nodes[uid] = { id: moduleId, bytesInOutput };

      for (const { path } of imports) {
        if (path in outputModule) {
          links.push({ source: uid, target: `${outputModuleId}-${path}` });
        }
      }
    }
  }

  return { nodes, links };
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
