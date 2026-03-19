import SubwaySchedule from './pages/SubwaySchedule';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '地铁班次查询',
    path: '/',
    element: <SubwaySchedule />
  }
];

export default routes;