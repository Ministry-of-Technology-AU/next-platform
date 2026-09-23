export { AppSidebar } from "./app-sidebar";

export { platformSidebar } from "./platform";
export { organisationSidebar } from "./organisation";
export { adminSidebar } from "./admin";

export {
  sidebarInterfaces,
  getSidebarInterface,
  resolveSidebar,
  resolveHref,
  getToolByHref,
  getToolIcon,
  getAllTools,
  type SidebarInterfaceId,
} from "./registry";

export type {
  SidebarItem,
  SidebarCategory,
  SidebarInterface,
  SidebarIcon,
  SidebarRole,
  SidebarRoleMap,
} from "./types";
