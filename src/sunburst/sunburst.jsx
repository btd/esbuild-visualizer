import { h } from "preact";
import { useState } from "preact/hooks";

import Node from "./node.jsx";

const SunBurst = ({
  root,
  layout,
  size,
  onNodeHover,
  arc,
  radius,
  sizeProperty,
  highlightedNodes,
}) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const desiredValue = root.originalValue[sizeProperty] * 0.2;

  //handle zoom of selected node
  const selectedNodeMultiplier =
    selectedNode != null
      ? (desiredValue > selectedNode.originalValue[sizeProperty]
          ? desiredValue / selectedNode.originalValue[sizeProperty]
          : 3) * selectedNode.height
      : 1;

  // i only need to increase value of leaf nodes
  // as folders will sum they up
  const nodesToIncrease =
    selectedNode != null
      ? selectedNode.children != null
        ? selectedNode.leaves()
        : [selectedNode]
      : [];

  const nodesToIncreaseSet = new Set(nodesToIncrease);

  // update value for nodes
  root = root.eachAfter((node) => {
    let sum = 0;
    const children = node.children;
    if (children != null) {
      let i = children.length;
      while (--i >= 0) sum += children[i].value;
    } else {
      sum = nodesToIncreaseSet.has(node)
        ? node.originalValue[sizeProperty] * selectedNodeMultiplier
        : node.originalValue[sizeProperty];
    }

    node.value = sum;
  });

  layout(root);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${radius},${radius})`}>
        {root.descendants().map((node) => {
          return (
            <Node
              key={node.nodeUid}
              node={node}
              onClick={() =>
                setSelectedNode(selectedNode === node ? null : node)
              }
              isSelected={selectedNode === node}
              onNodeHover={onNodeHover}
              path={arc(node)}
              highlighted={highlightedNodes.includes(node)}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default SunBurst;
