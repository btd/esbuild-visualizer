import { h, Fragment } from "preact";
import { useState } from "preact/hooks";

import {
  partition as d3partition,
  hierarchy as d3hierarchy,
} from "d3-hierarchy";

import uid from "../uid.js";
import { getAvailableSizeOptions } from "../sizes.js";

import SideBar from "../sidebar.jsx";
import Chart from "./chart.jsx";

const Main = ({ width, height, data: { tree, options = {} } }) => {
  const availableSizeProperties = getAvailableSizeOptions(options);

  const [sizeProperty, setSizeProperty] = useState(availableSizeProperties[0]);

  const layout = d3partition();

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

      node.nodeUid = uid("node");

      node.originalValue = value;
      node.value = value[sizeProperty];
    })
    .sort(
      (a, b) => b.originalValue[sizeProperty] - a.originalValue[sizeProperty]
    );

  const size = Math.min(width, height);
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
        size={size}
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
      />
    </>
  );
};

export default Main;
