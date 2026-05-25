import { LucideIcon } from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  colorClass: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup =>
  'children' in entry;
