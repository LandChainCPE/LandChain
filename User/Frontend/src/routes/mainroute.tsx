import { lazy, useEffect } from "react";
import { useRoutes, type RouteObject, useNavigate, useLocation } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/LoginMetamask")));
const MainPage = Loadable(lazy(() => import("../pages/MainPage/MainPage")));
const MainPageAfterLogin = Loadable(lazy(() => import("../pages/MainPage/MainPageAfterLogin")));
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
const LandMarkingMap = Loadable(lazy(() => import("../pages/mapbox_test/mapbox_test")));

const UserRegisland = Loadable(lazy(() => import("../pages/UserRegisLand/UserRegisLand")));

// Component สำหรับป้องกันหน้าที่ต้อง login
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLogin = localStorage.getItem("isLogin") === "true";
    
    if (!token || !isLogin) {
      // เก็บ path ปัจจุบันไว้เพื่อ redirect กลับมาหลัง login
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login", { replace: true });
    }
  }, [navigate, location]);

  const token = localStorage.getItem("token");
  const isLogin = localStorage.getItem("isLogin") === "true";
  
  if (!token || !isLogin) {
    return null; // หรือจะแสดง loading spinner
  }

  return children;
};

const UserRoutes = (): RouteObject[] => [
  {
    path: "/user",
    children: [
      { index: true, element: <MainPageAfterLogin /> },
      { 
        path: "regisland", 
        element: (
          <ProtectedRoute>
            <Regisland />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "dashboard", 
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "petition", 
        element: (
          <ProtectedRoute>
            <Petition />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "state", 
        element: (
          <ProtectedRoute>
            <State />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "sellmainpage", 
        element: (
          <ProtectedRoute>
            <SellMainPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "map", 
        element: (
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "sellpost", 
        element: (
          <ProtectedRoute>
            <SellPost />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "chat", 
        element: (
          <ProtectedRoute>
            <Chat roomId={null} onNewMessage={() => {}} />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "userregisland", 
        element: (
          <ProtectedRoute>
            <UserRegisland />
          </ProtectedRoute>
        ) 
      },
      { path: "*", element: <MainPageAfterLogin /> },
    ],
  },
];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/", 
    element: <MainPage />, 
  },                                          
  {
    path: "/login",
    element: <Login />
  },
  { 
    path: "/register", 
    element: <RegisterUser /> 
  },
  { 
    path: "/createaccount", 
    element: <CreateAccount/> 
  },
    {
    path: "/mapbox_test",
    element: <LandMarkingMap />
  },
  { 
    path: "/connectmetamask", 
    element: <ConnectMetamask /> 
  },

  // เพิ่ม user routes เข้ามาด้วย
  ...UserRoutes(),
  { 
    path: "*", 
    element: <MainPage /> 
  },
  
];

function ConfigRoutes() {
  const routes = MainRoutes();
  return useRoutes(routes);
}

export default ConfigRoutes;