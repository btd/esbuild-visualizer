import { useState } from "preact/hooks";
import { h, Fragment } from "preact";
import {
  hierarchy as d3hierarchy,
  treemap as d3treemap,
  treemapResquarify,
} from "d3-hierarchy";

import SideBar from "../sidebar.jsx";
import Chart from "./chart.jsx";

import createRainbowColor from "./color.js";
import { getAvailableSizeOptions } from "../sizes.js";

const Main = ({ width, height, data: { tree, links, options = {} } }) => {
  const availableSizeProperties = getAvailableSizeOptions(options);

  const [sizeProperty, setSizeProperty] = useState(availableSizeProperties[0]);

  const layout = d3treemap()
    .size([width, height])
    .paddingOuter(3)
    .paddingTop(20)
    .paddingInner(2)
    .round(true)
    .tile(treemapResquarify);

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
          value[prop] = node.data[prop] || 0;
        }
      }

      node.originalValue = value;
      node.value = value[sizeProperty];
    })
    .sort(
      (a, b) => b.originalValue[sizeProperty] - a.originalValue[sizeProperty]
    );

  const color = createRainbowColor(root);

  const importedByCache = new Map();
  const importedCache = new Map();

  for (const { source, target } of links || []) {
    if (!importedByCache.has(target)) {
      importedByCache.set(target, []);
    }
    if (!importedCache.has(source)) {
      importedCache.set(source, []);
    }

    importedByCache.get(target).push({ id: source });
    importedCache.get(source).push({ id: target });
  }

  return (
    <>
      <SideBar
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        setSizeProperty={setSizeProperty}
      />
      <Chart
        layout={layout}
        root={root}
        color={color}
        width={width}
        height={height}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        importedByCache={importedByCache}
        importedCache={importedCache}
      />
    </>
  );
};

export default Main;
