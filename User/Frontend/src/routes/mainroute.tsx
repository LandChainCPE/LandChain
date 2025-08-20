import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
//const MainUser = Loadable(lazy(() => import("../pages/LoginRegister/UserMain")));
const MainPage = Loadable(lazy(() => import("../pages/MainPage/MainPage")));
const LoginUser = Loadable(lazy(() => import("../pages/LoginRegister/Login")));
const RegisterUser = Loadable(lazy(() => import("../pages/LoginRegister/Register")));
//const MainPageUser = Loadable(lazy(() => import("../pages/Main/Main")));
const Regisland = Loadable(lazy(() => import("../pages/RegisLand/RegisLand")));

const Dashboard = Loadable(lazy(() => import("../pages/Petition/Dashboard")));
const Petition = Loadable(lazy(() => import("../pages/Petition/Petition")));
const State = Loadable(lazy(() => import("../pages/Petition/State")));

const SellMainPage = Loadable(lazy(() => import("../pages/Sell-Buy/SellMainpage")));
const Map = Loadable(lazy(() => import("../pages/Map/map")));
const SellPost = Loadable(lazy(() => import("../pages/SellPost/sellpost")));
const Chat = Loadable(lazy(() => import("../pages/ChatPage/chat")));

const CreateAccount = Loadable(lazy(() => import("../pages/CreateUser/CreateAccount")));
const ConnectMetamask = Loadable(lazy(() => import("../pages/CreateUser/ConnectMetamask")));

const LoginMetamask = Loadable(lazy(() => import("../pages/LoginRegister/LoginMetamask")));

const UserRegisLand = Loadable(lazy(() => import("../pages/RegisLand/UserRegisLand")));

const UserVerifyLand = Loadable(lazy(() => import("../pages/VerifyLand/VerifyLand")));

const UserMain = Loadable(lazy(() => import("../pages/MainPage/MainPageAfterLogin")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <MainPage />, 
  },                                      
  {
    path: "/user",
    children: [
      { index: true, element: <MainPage /> },
      {path: "main", element: <UserMain /> },
      {path: "regisland", element: <Regisland /> },
      {path: "dashboard", element: <Dashboard /> },
      {path: "petition", element: <Petition /> },
      {path: "state", element: <State /> },
      {path: "sellmainpage", element: <SellMainPage /> },
      {path: "map", element: <Map /> },
      {path: "sellpost", element: <SellPost /> },
      {path: "chat", element: <Chat roomId={null} onNewMessage={() => {}} /> },
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
      { index: true, element: <LoginMetamask /> },
    //   {path: "main", element: <Login /> },
      { path: "*", element: <Login /> },
    ],
  },
  { path: "*", element: <Login /> }, 
  { path: "/", element: <LoginUser /> },
  { path: "/login", element: <LoginMetamask /> },
  { path: "/register", element: <RegisterUser /> },
  { path: "/createaccount", element: <CreateAccount/> },
  { path: "/connectmetamask", element: <ConnectMetamask /> },

  { path: "/userregisland", element: <UserRegisLand /> },
  { path: "/verifyland", element: <UserVerifyLand /> },

  { path: "*", element: <LoginUser /> },
];

function ConfigRoutes() {
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
export default ConfigRoutes;