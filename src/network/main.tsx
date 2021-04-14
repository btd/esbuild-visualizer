import { h, Fragment, FunctionalComponent } from "preact";
import { useContext, useMemo, useState } from "preact/hooks";
import { scaleSqrt } from "d3-scale";
import { max } from "d3-array";
import webcola from "webcola";

import { ModuleRenderInfo, ModuleUID, SizeKey } from "../../types/types";

import { SideBar } from "../sidebar";
import { Chart } from "./chart";
import { NODE_MODULES } from "./util";

import { NetworkLink, NetworkNode, StaticContext } from "./index";
import { getModuleColor } from "./color";
import { useFilter } from "../use-filter";

export type LinkInfo = ModuleRenderInfo & { uid: ModuleUID };
export type ModuleLinkInfo = Map<ModuleUID, LinkInfo[]>;

export const Main: FunctionalComponent = () => {
  const { availableSizeProperties, nodes, data, width, height } = useContext(StaticContext);

  const [sizeProperty, setSizeProperty] = useState<SizeKey>(availableSizeProperties[0]);

  const { getModuleFilterMultiplier, setExcludeFilter, setIncludeFilter } = useFilter();

  const sizeScale = useMemo(() => {
    const maxLines = max(Object.values(nodes), (d) => d[sizeProperty]) as number;
    const size = scaleSqrt().domain([1, maxLines]).range([5, 30]);
    return size;
  }, [nodes, sizeProperty]);

  const processedNodes = Object.values(nodes)
    .map((node) => {
      const radius = sizeScale(node[sizeProperty] as number) + 1;
      return {
        ...node,
        width: radius * 2,
        height: radius * 2,
        radius,
        color: getModuleColor(node),
      };
    })
    .filter((networkNode) => getModuleFilterMultiplier(networkNode) === 1) as Array<NetworkNode>;

  const groups: Record<string, webcola.Group> = {};
  for (const node of processedNodes) {
    const match = NODE_MODULES.exec(node.id);
    if (match) {
      const [, nodeModuleName] = match;
      groups[nodeModuleName] = groups[nodeModuleName] ?? { leaves: [], padding: 1 };
      groups[nodeModuleName].leaves?.push(node);
    }
  }

  const nodesCache = new Map(processedNodes.map((d) => [d.uid, d]));

  // webcola has weird types, layour require array of links to Node references, but Nodes are computed from later
  const links: NetworkLink[] = data.links
    .map(({ source, target }) => {
      return {
        source: nodesCache.get(source) as NetworkNode,
        target: nodesCache.get(target) as NetworkNode,
        value: 1,
      };
    })
    .filter(({ source, target }) => {
      return source && target;
    });

  const cola = webcola.adaptor({}).size([width, height]);

  const paddingX = 20;
  const paddingY = 20;

  const pageBounds = {
    x: paddingX,
    y: paddingY,
    width: width - paddingX,
    height: height - paddingY,
  };

  const realGraphNodes = processedNodes.slice(0);
  const topLeft = { x: pageBounds.x, y: pageBounds.y, fixed: 1 };
  const tlIndex = (processedNodes as webcola.InputNode[]).push(topLeft) - 1;
  const bottomRight = {
    x: pageBounds.x + pageBounds.width,
    y: pageBounds.y + pageBounds.height,
    fixed: 1,
  };
  const brIndex = (processedNodes as webcola.InputNode[]).push(bottomRight) - 1;
  const constraints = [];
  for (let i = 0; i < realGraphNodes.length; i++) {
    const node = realGraphNodes[i];
    constraints.push({
      axis: "x",
      type: "separation",
      left: tlIndex,
      right: i,
      gap: node.radius,
    });
    constraints.push({
      axis: "y",
      type: "separation",
      left: tlIndex,
      right: i,
      gap: node.radius,
    });
    constraints.push({
      axis: "x",
      type: "separation",
      left: i,
      right: brIndex,
      gap: node.radius,
    });
    constraints.push({
      axis: "y",
      type: "separation",
      left: i,
      right: brIndex,
      gap: node.radius,
    });
  }

  cola
    .nodes(processedNodes)
    .links(links)
    //.groups(Object.values(groups))
    .groupCompactness(1e-3)
    .constraints(constraints)
    .jaccardLinkLengths(50, 0.7)
    .avoidOverlaps(true)
    .handleDisconnected(false)
    .start(30, 30, 30, 30, false, true)
    .stop();

  return (
    <>
      <SideBar
        sizeProperty={sizeProperty}
        availableSizeProperties={availableSizeProperties}
        setSizeProperty={setSizeProperty}
        onExcludeChange={setExcludeFilter}
        onIncludeChange={setIncludeFilter}
      />
      <Chart nodes={realGraphNodes} groups={{}} links={links} sizeProperty={sizeProperty} />
    </>
  );
};
