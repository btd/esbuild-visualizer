import { promises as fs } from "fs";
import path from "path";

import opn from "open";

import { version } from "./version";

import { TemplateType } from "./template-types";
import { ModuleMapper } from "./module-mapper";
import { addLinks, buildTree, mergeTrees } from "./data";
import { buildHtml } from "./build-stats";
import { ModuleLink, ModuleRenderInfo, ModuleTree, ModuleTreeLeaf, VisualizerData } from "../types/types";
import { Metadata } from "../types/metafile";

export interface PluginVisualizerOptions {
  filename?: string;
  title?: string;
  open?: boolean;
  openOptions?: opn.Options;
  template?: TemplateType;
  include?: RegExp[];
  exclude?: RegExp[];
}

export const visualizer = async (metadata: Metadata, opts: PluginVisualizerOptions = {}): Promise<void> => {
  const filename = opts.filename ?? "stats.html";
  const title = opts.title ?? "EsBuild Visualizer";

  const open = !!opts.open;
  const openOptions = opts.openOptions ?? {};

  const template = opts.template ?? "treemap";
  const projectRoot = "";

  const renderedModuleToInfo = (id: string, mod: { bytesInOutput: number }): ModuleRenderInfo => {
    const result = {
      id,
      renderedLength: mod.bytesInOutput,
    };
    return result;
  };

  const roots: Array<ModuleTree | ModuleTreeLeaf> = [];
  const mapper = new ModuleMapper(projectRoot);
  const links: ModuleLink[] = [];

  // collect trees
  for (const [bundleId, bundle] of Object.entries(metadata.outputs)) {
    const modules = Object.entries(bundle.inputs).map(([id, mod]) => renderedModuleToInfo(id, mod));

    const tree = buildTree(bundleId, modules, mapper);

    roots.push(tree);
  }

  /*
  for (const [bundleId, bundle] of Object.entries(outputBundle)) {
    if (bundle.type !== "chunk" || bundle.facadeModuleId == null) continue; //only chunks

    addLinks(
      bundleId,
      bundle.facadeModuleId,
      this.getModuleInfo.bind(this),
      links,
      mapper
    );
  }*/

  const tree = mergeTrees(roots);

  const data: VisualizerData = {
    version,
    tree,
    nodes: mapper.getNodes(),
    nodeParts: mapper.getNodeParts(),
    links,
    env: {},
    options: {
      gzip: false,
      brotli: false,
      sourcemap: false,
    },
  };

  const fileContent: string = await buildHtml({
    title,
    data,
    template,
  });

  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, fileContent);

  if (open) {
    await opn(filename, openOptions);
  }
};
