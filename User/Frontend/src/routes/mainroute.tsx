import { lazy } from "react";
import { useRoutes, type RouteObject } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const MainPage = Loadable(lazy(() => import("../pages/MainPage/MainPage")));
const LoginUser = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const RegisterUser = Loadable(lazy(() => import("../pages/LoginRegister/Register")));
const Regisland = Loadable(lazy(() => import("../pages/RegisLand/RegisLand")));
const Dashboard = Loadable(lazy(() => import("../pages/Petition/Dashboard")));
const Petition = Loadable(lazy(() => import("../pages/Petition/Petition")));
const State = Loadable(lazy(() => import("../pages/Petition/State")));
const SellMainPage = Loadable(lazy(() => import("../pages/Sell-Buy/SellMainpage")));
const Map = Loadable(lazy(() => import("../pages/Map/map")));
const SellPostMain = Loadable(lazy(() => import("../pages/SellPost/sellpostmain.tsx")));
const Chat = Loadable(lazy(() => import("../pages/ChatPage/chat")));
const Countservice = Loadable(lazy(() => import("../pages/service/countservice")));
const CreateAccount = Loadable(lazy(() => import("../pages/CreateUser/CreateAccount")));
const ConnectMetamask = Loadable(lazy(() => import("../pages/CreateUser/ConnectMetamask")));
const SellPost = Loadable(lazy(() => import("../pages/SellPost/sellpost.tsx")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <MainPage />,
  },
  {
    path: "/user",
    children: [
      { index: true, element: <MainPage /> },
      { path: "main", element: <MainPage /> },
      { path: "regisland", element: <Regisland /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "petition", element: <Petition /> },
      { path: "state", element: <State /> },
      { path: "sellmainpage", element: <SellMainPage /> },
      { path: "map", element: <Map /> },
      { path: "sellpostmain", element: <SellPostMain /> },
      { path: "chat", element: <Chat roomId={null} onNewMessage={() => {}} /> },
      { path: "service", element: <Countservice /> },
      { path: "sellpost", element: <SellPost /> },
      { path: "*", element: <MainPage /> },
    ],
  },
  { path: "*", element: <MainPage /> },
];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/",
    element: <MainPage />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "*", element: <MainPage /> },
    ],
  },
  {
    path: "/login",
    children: [
      { index: true, element: <Login /> },
      { path: "*", element: <Login /> },
    ],
  },
  { path: "*", element: <LoginUser /> },
  { path: "/register", element: <RegisterUser /> },
  { path: "/createaccount", element: <CreateAccount /> },
  { path: "/connectmetamask", element: <ConnectMetamask /> },
  //{ path: "/sellpost", element: <SellPost /> },
  { path: "*", element: <LoginUser /> },
];

/*function ConfigRoutes() {
  // localStorage.setItem('isLogin','false');
  // const isLoggedIn = localStorage.getItem('isLogin') === 'true';
//   const roleName = localStorage.getItem('roleName');
//   const employeeID = localStorage.getItem('employeeid');
//   const userid = localStorage.getItem('userid');


//   console.log("roleName:", roleN  console.log("ค่า isLoggedIn:", isLoggedIn);ame);
//   console.log("employeeid:", employeeID);
//   console.log("userid:", userid);

  let routes: RouteObject[] = [];

  if (false) { // เปลี่ยนเป็นเงื่อนไขที่เหมาะสมสำหรับการตรวจสอบการเข้าสู่ระบบ
    routes = UserRoutes();
  } 
  else {
    routes = MainRoutes();
  }
  return useRoutes(routes);
}
export default ConfigRoutes;*/


function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true'; // ตรวจสอบการล็อกอินจาก localStorage
  let routes: RouteObject[] = [];

  if (isLoggedIn) { // ถ้าเข้าสู่ระบบแล้ว
    routes = UserRoutes();
  } else {
    routes = MainRoutes();
  }

  return useRoutes(routes); // ใช้ useRoutes เพื่อกำหนดเส้นทาง
}

export default ConfigRoutes;
