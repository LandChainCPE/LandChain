import { lazy } from "react";
import { useRoutes, type RouteObject} from "react-router-dom";
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
const SellPost = Loadable(lazy(() => import("../pages/SellPost/sellpost")));
const Chat = Loadable(lazy(() => import("../pages/ChatPage/chat")));

const CreateAccount = Loadable(lazy(() => import("../pages/CreateUser/CreateAccount")));
const ConnectMetamask = Loadable(lazy(() => import("../pages/CreateUser/ConnectMetamask")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", 
    element: <MainPage />, 
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
      { path: "sellpost", element: <SellPost /> },
      { path: "chat", element: <Chat roomId={null} onNewMessage={() => {}} /> },
      { path: "*", element: <MainPage /> },
    ],
  },
  { path: "*", element: <MainPage /> }, 
];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/", 
    element: <MainPage />, 
  },
  {
    path: "/login",
    element: <Login />,
  },
  { path: "/register", element: <RegisterUser /> },
  { path: "/createaccount", element: <CreateAccount/> },
  { path: "/connectmetamask", element: <ConnectMetamask /> },
  { path: "*", element: <MainPage /> },
];

function ConfigRoutes() {
  // ตรวจสอบสถานะการเข้าสู่ระบบจาก localStorage
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
  
  console.log("ค่า isLoggedIn:", isLoggedIn);

  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    routes = UserRoutes();
  } else {
    routes = MainRoutes();
  }
  
  return useRoutes(routes);
}

export default ConfigRoutes;