import { lazy, useEffect } from "react";
import { useRoutes, type RouteObject, useNavigate, useLocation } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../pages/LoginRegister/LoginMetamask")));
const MainPage = Loadable(lazy(() => import("../pages/MainPage/MainPage")));
const MainPageAfterLogin = Loadable(lazy(() => import("../pages/MainPage/MainPageAfterLogin")));
const RegisterUser = Loadable(lazy(() => import("../pages/LoginRegister/Register")));
const Regisland = Loadable(lazy(() => import("../pages/RegisLand/RegisLand")));
const LandCardList = Loadable(lazy(() => import("../pages/LandToBlockChain/LandCardList.tsx")));
const LandToBlockchain = Loadable(lazy(() => import("../pages/LandToBlockChain/LandToBlockchain.tsx")));

const VerifyUser = Loadable(lazy(() => import("../pages/VerifyUser/verifyuser")));


const Petition = Loadable(lazy(() => import("../pages/Petition/Petition")));

const SellMainPage = Loadable(lazy(() => import("../pages/Sell-Buy/SellMainpage")));
const Map = Loadable(lazy(() => import("../pages/Map/map")));
const SellPost = Loadable(lazy(() => import("../pages/SellPost/sellpost.tsx")));
const SellPostMain = Loadable(lazy(() => import("../pages/SellPost/sellpostmain.tsx")));
const LandDetail = Loadable(lazy(() => import("../pages/SellPost/landdetail.tsx")));
const FullMapView = Loadable(lazy(() => import("../pages/SellPost/FullMapView.tsx")));

const Chat = Loadable(lazy(() => import("../pages/ChatPage/chat")));

const CreateAccount = Loadable(lazy(() => import("../pages/CreateUser/CreateAccount")));
const ConnectMetamask = Loadable(lazy(() => import("../pages/CreateUser/ConnectMetamask")));
const LandMarkingMap = Loadable(lazy(() => import("../pages/mapbox_test/mapbox_test")));

const UserRegisland = Loadable(lazy(() => import("../pages/UserRegisLand/UserRegisLand")));
const UserDashboard = Loadable(lazy(() => import("../pages/UserDashboard/UserDashboard")));
const VerifyLand = Loadable(lazy(() => import("../pages/VerifyLand/VerifyLand")));

const RequestSell = Loadable(lazy(() => import("../pages/RequestSell/ReausetSell")));
const RequestBuy = Loadable(lazy(() => import("../pages/RequestSell/RequsetBuy")));
const Transation = Loadable(lazy(() => import("../pages/RequestSell/TransationTimeline")));
const History = Loadable(lazy(() => import("../pages/Landhistory/landhistory.tsx")));
const CheckLandowner = Loadable(lazy(() => import("../pages/RequestSell/Checklandowner.tsx")));
const AppointmentStatus = Loadable(lazy(() => import("../pages/appointmentstatus/appointmentstatus")));

const Testland = Loadable(lazy(() => import("../pages/VerifyLand/testland.tsx")));

// Component สำหรับป้องกันหน้าที่ต้อง login
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLogin = localStorage.getItem("isLogin") === "true";

    if (!token || !isLogin) {
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login", { replace: true });
      return;
    }

    // ตรวจสอบ Token กับ API
    fetch("/api/validate-token", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          // ลบ Token และ Redirect ไปหน้า Login
          localStorage.removeItem("token");
          localStorage.removeItem("isLogin");
          navigate("/login", { replace: true });
        }
      })
      .catch((error) => {
        console.error("Error validating token:", error);
      });
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
        path: "petition", 
        element: (
          <ProtectedRoute>
            <Petition />
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
            <Chat roomId={null} onNewMessage={() => { }} />
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
      {
        path: "sellpostmain",
        element: (
          <ProtectedRoute>
            <SellPostMain />
          </ProtectedRoute>
        )
      },
      {
        path: "landdetail/:id",
        element: (
          <ProtectedRoute>
            <LandDetail />
          </ProtectedRoute>
        )
      },
      { 
        path: "fullmapview", 
        element: (
          <ProtectedRoute>
            <FullMapView />
          </ProtectedRoute>
        )
      },
      { 
        path: "requestsell", 
        element: (
          <ProtectedRoute>
            <RequestSell />
          </ProtectedRoute>
        )
      },
      {
        path: "requestbuy",
        element: (
          <ProtectedRoute>
            <RequestBuy />
          </ProtectedRoute>
        )
      },
      {
        path: "transation",
        element: (
          <ProtectedRoute>
            <Transation />
          </ProtectedRoute>
        )
      },
      {
        path: "verifyusertoblockchain",
        element: (
          <ProtectedRoute>
            <VerifyUser />
          </ProtectedRoute>
        )
      },
      {
        path: "userdashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "verifyland",
        element: (
          <ProtectedRoute>
            <VerifyLand />
          </ProtectedRoute>
        )
      },
      { 

        path: "landcardlist", 
        element: (
          <ProtectedRoute>
            <LandCardList />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "landtoblockchain", 
        element: (
          <ProtectedRoute>
            <LandToBlockchain />

          </ProtectedRoute>
        ) 
      },
      { 
        path: "appointmentstatus", 
        element: (
          <ProtectedRoute>
            <AppointmentStatus />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "testland", 
        element: (
          <ProtectedRoute>
            <Testland />
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
    element: <CreateAccount />
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



