import { ModuleImport, ModuleMeta, ModulePart, ModuleLengths, ModuleUID } from "../types/types";
import { getUid } from "./uid";

const nanoid = getUid("1234567890abcdef", 4);

const UNIQUE_PREFIX = nanoid();
let COUNTER = 0;

const uniqueId = (): ModuleUID => `${UNIQUE_PREFIX}-${COUNTER++}`;

type ModuleIdStorage = {
  uid: ModuleUID;
  meta: Omit<ModuleMeta, "imported" | "importedBy"> & {
    imported: Set<string>;
    importedBy: Set<string>;
  };
};

export class ModuleMapper {
  private nodeParts: Record<ModuleUID, ModulePart> = {};
  private nodeMetas: Record<string, ModuleIdStorage> = {};

  constructor(private projectRoot: string | RegExp) {}

  trimProjectRootId(moduleId: string): string {
    return moduleId.replace(this.projectRoot, "");
  }

  getModuleUid(moduleId: string): ModuleUID {
    if (!(moduleId in this.nodeMetas)) {
      this.nodeMetas[moduleId] = {
        uid: uniqueId(),
        meta: {
          id: this.trimProjectRootId(moduleId),
          moduleParts: {},
          imported: new Set(),
          importedBy: new Set(),
        },
      };
    }

    return this.nodeMetas[moduleId].uid;
  }

  getBundleModuleUid(bundleId: string, moduleId: string): ModuleUID {
    if (!(moduleId in this.nodeMetas)) {
      this.nodeMetas[moduleId] = {
        uid: uniqueId(),
        meta: {
          id: this.trimProjectRootId(moduleId),
          moduleParts: {},
          imported: new Set(),
          importedBy: new Set(),
        },
      };
    }
    if (!(bundleId in this.nodeMetas[moduleId].meta.moduleParts)) {
      this.nodeMetas[moduleId].meta.moduleParts[bundleId] = uniqueId();
    }

    return this.nodeMetas[moduleId].meta.moduleParts[bundleId];
  }

  setNodePart(bundleId: string, moduleId: string, value: ModuleLengths): ModuleUID {
    const uid = this.getBundleModuleUid(bundleId, moduleId);
    if (uid in this.nodeParts) {
      throw new Error(
        `Override module: bundle id ${bundleId}, module id ${moduleId}, value ${JSON.stringify(
          value
        )}, existing value: ${JSON.stringify(this.nodeParts[uid])}`
      );
    }
    this.nodeParts[uid] = { ...value, mainUid: this.getModuleUid(moduleId) };
    return uid;
  }

  setNodeMeta(moduleId: string, value: { isEntry?: boolean; isExternal?: boolean }): void {
    this.getModuleUid(moduleId);
    this.nodeMetas[moduleId].meta.isEntry = value.isEntry;
    this.nodeMetas[moduleId].meta.isExternal = value.isExternal;
  }

  hasNodePart(bundleId: string, moduleId: string): boolean {
    if (!(moduleId in this.nodeMetas)) {
      return false;
    }
    if (!(bundleId in this.nodeMetas[moduleId].meta.moduleParts)) {
      return false;
    }
    if (!(this.nodeMetas[moduleId].meta.moduleParts[bundleId] in this.nodeParts)) {
      return false;
    }
    return true;
  }

  getNodeParts(): ModuleMapper["nodeParts"] {
    return this.nodeParts;
  }

  getNodeMetas(): Record<ModuleUID, ModuleMeta> {
    const nodeMetas: Record<ModuleUID, ModuleMeta> = {};
    for (const { uid, meta } of Object.values(this.nodeMetas)) {
      nodeMetas[uid] = {
        ...meta,
        imported: [...meta.imported].map((rawImport) => {
          const [uid, dynamic] = rawImport.split(",");
          const importData: ModuleImport = { uid };
          if (dynamic === "true") {
            importData.dynamic = true;
          }
          return importData;
        }),
        importedBy: [...meta.importedBy].map((rawImport) => {
          const [uid, dynamic] = rawImport.split(",");
          const importData: ModuleImport = { uid };
          if (dynamic === "true") {
            importData.dynamic = true;
          }
          return importData;
        }),
      };
    }
    return nodeMetas;
  }

  addImportedByLink(targetId: string, sourceId: string): void {
    const sourceUid = this.getModuleUid(sourceId);
    this.getModuleUid(targetId);
    this.nodeMetas[targetId].meta.importedBy.add(sourceUid);
  }

  addImportedLink(sourceId: string, targetId: string, dynamic = false): void {
    const targetUid = this.getModuleUid(targetId);
    this.getModuleUid(sourceId);
    this.nodeMetas[sourceId].meta.imported.add(String([targetUid, dynamic]));
  }
}
