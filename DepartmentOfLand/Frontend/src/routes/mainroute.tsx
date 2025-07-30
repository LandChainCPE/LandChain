import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const Main = Loadable(lazy(() => import("../pages/Main")));
const RegisLand = Loadable(lazy(() => import("../pages/regisland/RegisLand")));
const Receive = Loadable(lazy(() => import("../pages/Petition/receive")));

const UserRoutes = (): RouteObject[] => [
  
  {path: "/", element: <Main />, },                                          
  {path: "main", element: <Main /> },
  {path: "regisland", element: <RegisLand /> },
  {path: "receive", element: <Receive /> },
  { path: "*", element: <Main /> },

];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/", element: <Login />, 
  },                                          
  {
    path: "/login",
    children: [
      { index: true, element: <Login /> },
    //   {path: "main", element: <Login /> },
      { path: "*", element: <Login /> },
    ],
  },
  { path: "*", element: <Login /> }, 
];

function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
//   const roleName = localStorage.getItem('roleName');
//   const employeeID = localStorage.getItem('employeeid');
//   const userid = localStorage.getItem('userid');

  console.log("ค่า isLoggedIn:", isLoggedIn);
//   console.log("roleName:", roleName);
//   console.log("employeeid:", employeeID);
//   console.log("userid:", userid);

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