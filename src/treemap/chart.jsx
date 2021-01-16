import { useState, useEffect } from "preact/hooks";
import { h, Fragment } from "preact";

import TreeMap from "./treemap.jsx";
import Tooltip from "./tooltip.jsx";

const Chart = ({
  layout,
  root,
  color,
  width,
  height,
  sizeProperty,
  availableSizeProperties,
  importedCache,
  importedByCache,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipNode, setTooltipNode] = useState(null);

  const handleMouseOut = () => {
    setShowTooltip(false);
  };

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOut);
    };
  }, []);

  return (
    <>
      <TreeMap
        layout={layout}
        root={root}
        color={color}
        width={width}
        height={height}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        onNodeHover={(node) => {
          setTooltipNode(node);
          setShowTooltip(true);
        }}
      />
      <Tooltip
        visible={showTooltip}
        node={tooltipNode}
        root={root}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        importedByCache={importedByCache}
        importedCache={importedCache}
      />
    </>
  );
};

export default Chart;
