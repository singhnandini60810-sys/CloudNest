import {
  Activity,
  Bot,
  Clock3,
  FileHeart,
  Files,
  FolderOpen,
  HardDrive,
  LayoutDashboard,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";

export const mainNavigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "My Files",
    path: "/files",
    icon: FolderOpen,
  },
  {
    label: "Shared Files",
    path: "/shared",
    icon: Share2,
  },
  {
    label: "Recent",
    path: "/recent",
    icon: Clock3,
  },
  {
    label: "Favorites",
    path: "/favorites",
    icon: FileHeart,
  },
  {
    label: "Trash",
    path: "/trash",
    icon: Trash2,
  },
];

export const secondaryNavigation = [
  {
    label: "Activity",
    path: "/activity",
    icon: Activity,
  },
  {
    label: "Storage",
    path: "/storage",
    icon: HardDrive,
  },
  {
    label: "AI Assistants",
    path: "/assistants",
    icon: Bot,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export const mobileNavigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Files",
    path: "/files",
    icon: Files,
  },
  {
    label: "Upload",
    path: "/upload",
    icon: FolderOpen,
  },
  {
    label: "Shared",
    path: "/shared",
    icon: Share2,
  },
  {
    label: "Profile",
    path: "/settings",
    icon: Settings,
  },
];