import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";
import { ModuleDisplayModeAdminForm } from "@/features/module-display-mode/components/ModuleDisplayModeAdminForm";

export default function AdminDisplayModesPage() {
  return (
    <ModulePageShell title="展示模式配置" description="先用本地原型把模块 real / demo 切换流程走通，后续再接服务端。">
      <ModuleDisplayModeAdminForm />
    </ModulePageShell>
  );
}
