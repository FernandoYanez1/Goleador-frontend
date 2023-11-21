export interface BreadCrumbItem {
  label?: string;
  url?: string;
  icon?: string;
  id: string;
}

export interface BreadCrumbState {
  items: BreadCrumbItem[];
}

export interface BreadCrumbAction {
  type: string;
  items: BreadCrumbItem[];
  item: BreadCrumbItem;
  id: string;
}
