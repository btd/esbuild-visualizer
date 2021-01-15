import { render } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import { html } from "htm/preact";

import { format as formatBytes } from "bytes";

import {
  partition as d3partition,
  hierarchy as d3hierarchy,
} from "d3-hierarchy";
import { arc as d3arc } from "d3-shape";
import { scaleLinear, scaleSqrt } from "d3-scale";

import color from "./color";

import { LABELS, getAvailableSizeOptions } from "./sizes";

import "./style/style-sunburst.scss";

const Tooltip = ({ node, root, sizeProperty, availableSizeProperties }) => {
  const content = useMemo(() => {
    if (!node) return null;

    const mainSize = node.originalValue[sizeProperty];

    const percentageNum = (100 * mainSize) / root.originalValue[sizeProperty];
    const percentage = percentageNum.toFixed(2);
    const percentageString = percentage + "%";

    return html`
      <div class="details-name">${node.data.name}</div>
      <div class="details-percentage">${percentageString}</div>
      ${availableSizeProperties.map((sizeProp) => {
        if (sizeProp === sizeProperty) {
          return html`
            <div class="details-size">
              <b
                >${LABELS[sizeProp]}:${" "}${formatBytes(
                  node.originalValue[sizeProp]
                )}</b
              >
            </div>
          `;
        } else {
          return html`
            <div class="details-size">
              ${LABELS[sizeProp]}:${" "}
              ${formatBytes(node.originalValue[sizeProp])}
            </div>
          `;
        }
      })}
    `;
  }, [node]);

  return html`
    <div class="details">
      ${content}
    </div>
  `;
};

const Node = ({
  node,
  onClick,
  isSelected,
  onNodeHover,
  path,
  highlighted,
}) => {
  return html`
    <path
      d=${path}
      fill-rule="evenodd"
      stroke="#fff"
      fill=${color(node)}
      stroke-width=${isSelected ? 3 : null}
      onClick=${onClick}
      onMouseOver=${(evt) => {
        evt.stopPropagation();
        onNodeHover(node);
      }}
      opacity=${highlighted ? 1 : 0.3}
    />
  `;
};

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

  return html`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox=${`0 0 ${size} ${size}`}>
      <g transform=${`translate(${radius},${radius})`}>
        ${root.descendants().map((node) => {
          return html`
            <${Node}
              node=${node}
              onClick=${() =>
                setSelectedNode(selectedNode === node ? null : node)}
              isSelected=${selectedNode === node}
              onNodeHover=${onNodeHover}
              path=${arc(node)}
              highlighted=${highlightedNodes.includes(node)}
            />
          `;
        })}
      </g>
    </svg>
  `;
};

const Chart = ({
  layout,
  root,
  size,
  sizeProperty,
  availableSizeProperties,
}) => {
  const [tooltipNode, setTooltipNode] = useState(root);
  const [highlightedNodes, setHighlightedNodes] = useState(root.descendants());

  const handleMouseOut = () => {
    setTooltipNode(root);
    setHighlightedNodes(root.descendants());
  };

  useEffect(() => {
    handleMouseOut();
    document.addEventListener("mouseover", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOut);
    };
  }, [root]);

  const radius = size / 2;

  const x = scaleLinear().range([0, 2 * Math.PI]);
  const y = scaleSqrt().range([0, radius]);

  const arc = d3arc()
    .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
    .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
    .innerRadius((d) => y(d.y0))
    .outerRadius((d) => y(d.y1));

  return html`
    <${SunBurst}
      layout=${layout}
      root=${root}
      size=${size}
      radius=${radius}
      arc=${arc}
      sizeProperty=${sizeProperty}
      availableSizeProperties=${availableSizeProperties}
      onNodeHover=${(node) => {
        setTooltipNode(node);
        setHighlightedNodes(node.ancestors());
      }}
      highlightedNodes=${highlightedNodes}
    />
    <${Tooltip}
      node=${tooltipNode}
      root=${root}
      sizeProperty=${sizeProperty}
      availableSizeProperties=${availableSizeProperties}
    />
  `;
};

const SideBar = ({
  availableSizeProperties,
  sizeProperty,
  setSizeProperty,
}) => {
  const handleChange = (sizeProp) => () => {
    if (sizeProp !== sizeProperty) {
      setSizeProperty(sizeProp);
    }
  };
  return html`
    <aside class="sidebar">
      <div class="size-selectors">
        ${availableSizeProperties.length > 1 &&
        availableSizeProperties.map((sizeProp) => {
          const id = `selector-${sizeProp}`;
          return html`
            <div class="size-selector">
              <input
                type="radio"
                id=${id}
                checked=${sizeProp === sizeProperty}
                onChange=${handleChange(sizeProp)}
              />
              <label for=${id}>
                ${LABELS[sizeProp]}
              </label>
            </div>
          `;
        })}
      </div>
    </aside>
  `;
};

const Main = ({ width, height, data: { tree, nodes, options = {} } }) => {
  const availableSizeProperties = getAvailableSizeOptions(options);

  const [sizeProperty, setSizeProperty] = useState(availableSizeProperties[0]);

  const size = Math.min(width, height);

  const root = d3hierarchy(tree)
    .eachAfter((node) => {
      const value = {};
      for (const prop of availableSizeProperties) {
        value[prop] = 0;
      }

      // use node.data.children because if it is empty d3 will skip this node
      // and it will look like it is actually a leaf - which technically it is but not exactly
      // it is just a chunk without deps - usually just with imports
      if (node.children == null && node.data.children != null) {
        // this should be root withiout children
        for (const prop of availableSizeProperties) {
          value[prop] += node.data[prop] || 0;
        }
      } else if (node.data.children != null) {
        const children = node.children;
        let i = node.data.children.length;
        while (--i >= 0) {
          for (const prop of availableSizeProperties) {
            value[prop] += children[i].originalValue[prop] || 0;
          }
        }
      } else {
        for (const prop of availableSizeProperties) {
          value[prop] = nodes[node.data.uid][prop] || 0;
        }
      }

      node.originalValue = value;
      node.value = value[sizeProperty];
    })
    .sort(
      (a, b) => b.originalValue[sizeProperty] - a.originalValue[sizeProperty]
    );

  const layout = d3partition();

  return html`
    <${SideBar}
      sizeProperty=${sizeProperty}
      availableSizeProperties=${availableSizeProperties}
      setSizeProperty=${setSizeProperty}
    />
    <${Chart}
      layout=${layout}
      root=${root}
      size=${size}
      sizeProperty=${sizeProperty}
      availableSizeProperties=${availableSizeProperties}
    />
  `;
};

const drawChart = (parentNode, data, width, height) => {
  render(
    html` <${Main} data=${data} width=${width} height=${height} /> `,
    parentNode
  );
};

export default drawChart;
