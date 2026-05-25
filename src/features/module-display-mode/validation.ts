//  职责：把外部传进来的 body 解析成一份合法的业务输入。合法返回 moduleId 和 displayMode。
//  否则直接抛出错误。
import { moduleIds, type DisplayMode, type ModuleId } from "./configurableModules";

function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && moduleIds.includes(value as ModuleId);
}

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === "real" || value === "demo";
}

export function parseDisplayModeUpdate(body: {
  moduleId?: unknown;
  displayMode?: unknown;
}) {
  const { moduleId, displayMode } = body;

  if (!isModuleId(moduleId)) {
    throw new Error("moduleId 不合法");
  }

  if (!isDisplayMode(displayMode)) {
    throw new Error("displayMode 只能是 real 或 demo");
  }

  return {
    moduleId,
    displayMode,
  };
}
