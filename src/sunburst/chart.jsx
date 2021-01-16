import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import { arc as d3arc } from "d3-shape";
import { scaleLinear, scaleSqrt } from "d3-scale";

import SunBurst from "./sunburst.jsx";
import Tooltip from "./tooltip.jsx";

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

  return (
    <>
      <SunBurst
        layout={layout}
        root={root}
        size={size}
        radius={radius}
        arc={arc}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        onNodeHover={(node) => {
          setTooltipNode(node);
          setHighlightedNodes(node.ancestors());
        }}
        highlightedNodes={highlightedNodes}
      />
      <Tooltip
        node={tooltipNode}
        root={root}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
      />
    </>
  );
};

export default Chart;
