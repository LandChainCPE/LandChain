import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const MainUser = Loadable(lazy(() => import("../pages/LoginRegister/UserMain")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <MainUser />, 
  },                                          
  {
    path: "/user",
    children: [
      { index: true, element: <MainUser /> },
      {path: "main", element: <MainUser /> },
      { path: "*", element: <MainUser /> },
    ],
  },
  { path: "*", element: <MainUser /> }, 
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