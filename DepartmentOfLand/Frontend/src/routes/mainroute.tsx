import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";
import Layout from "../component/Layout";

const Main = Loadable(lazy(() => import("../pages/Main")));
const Verify = Loadable(lazy(() => import("../pages/Verify")));
const RegisLand = Loadable(lazy(() => import("../pages/regisland/RegisLand")));
const Transfer = Loadable(lazy(() => import("../pages/Transfer")));
const Settings = Loadable(lazy(() => import("../pages/Settings")));
const StatePetition = Loadable(lazy(() => import("../pages/Petition")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Main /> },
      { path: "operations", element: <Main /> },
      { path: "verify", element: <Verify /> },
      { path: "regisland", element: <RegisLand /> },
      { path: "transfer", element: <Transfer /> },
      { path: "settings", element: <Settings /> },
      { path: "statepetition", element: <StatePetition /> },
      { path: "*", element: <Main /> },
    ],
  },
];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/", element: <Main />, 
  },                                          
  {
    path: "/login",
    children: [
      { index: true, element: <Main /> },
      { path: "*", element: <Main /> },
    ],
  },
  { path: "*", element: <Main /> }, 
];

function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
  console.log("ค่า isLoggedIn:", isLoggedIn);
  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    routes = UserRoutes();
  } 
  else {
    routes = MainRoutes();
  }
  return useRoutes(routes);
}
export default ConfigRoutes;