import {
  LayoutDashboard,
  Church,
  ListCheck,
  Users2,
  User2,
} from 'lucide-react';

const items = [
  {
    title: 'Dashboard',
    url: '/d',
    icon: LayoutDashboard,
  },
  {
    title: 'Churches',
    url: '/d/churches',
    icon: Church,
  },
  {
    title: 'Fellowships/PCF',
    url: '/d/fellowships',
    icon: ListCheck,
  },
  {
    title: 'Cells',
    url: '/d/cells',
    icon: Users2,
  },
  {
    title: 'Workers in Training',
    url: '/d/workers',
    icon: User2,
  },
  {
    title: 'Members',
    url: '/d/members',
    icon: User2,
  },
];

export const getRouteNameFromPath = (pathname: string) =>
  items.find((m) => m.url === pathname)?.title;
