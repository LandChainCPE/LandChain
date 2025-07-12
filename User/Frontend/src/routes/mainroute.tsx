import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const LoginUser = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const RegisterUser = Loadable(lazy(() => import("../pages/LoginRegister/Register")));
const MainPageUser = Loadable(lazy(() => import("../pages/Main/Main")));
const Regisland = Loadable(lazy(() => import("../pages/RegisLand/RegisLand")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <MainPageUser />, 
  },                                          
  {
    path: "/user",
    children: [
      { index: true, element: <MainPageUser /> },
      {path: "main", element: <MainPageUser /> },
      {path: "regisland", element: <Regisland /> },
      { path: "*", element: <MainPageUser /> },
    ],
  },
  { path: "*", element: <MainPageUser /> }, 
];


const MainRoutes = (): RouteObject[] => [
  { path: "/", element: <LoginUser /> },
  { path: "/login", element: <LoginUser /> },
  { path: "/register", element: <RegisterUser /> },
  { path: "*", element: <LoginUser /> },
];

function ConfigRoutes() {
  //localStorage.setItem('isLogin','false');
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
//   const roleName = localStorage.getItem('roleName');
//   const employeeID = localStorage.getItem('employeeid');
//   const userid = localStorage.getItem('userid');


//   console.log("roleName:", roleN  console.log("ค่า isLoggedIn:", isLoggedIn);ame);
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