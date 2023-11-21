import {IconProp} from '@fortawesome/fontawesome-svg-core';

export interface MenuItem {
  label?: string;
  icon?: IconProp;
  url?: string;
  className?: string;
  modulo?: any;
  items?: MenuItem[];
  majorPath?: string;
  id?: string;
}
