import { lazy, useEffect, useState } from "react";
import { useRoutes, type RouteObject, useNavigate, useLocation } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";
import { CheckVerify } from "../service/https/bam/bam";
import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

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

const Chat = Loadable(lazy(() => import("../pages/ChatPage/chat.tsx")));

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
// ✅ ต้องทั้ง login + verify
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLogin = localStorage.getItem("isLogin") === "true";

    if (!token || !isLogin) {
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login", { replace: true });
      return;
    }

    fetch("/api/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("isLogin");
          navigate("/login", { replace: true });
          return;
        }
        const verifyRes = await CheckVerify();
        if (verifyRes?.verified) {
          setIsVerified(true);
        } else {
          Swal.fire({
            title: "⚠️ Verification Required",
            text: "คุณต้องยืนยันตัวตนก่อนเข้าใช้งานหน้านี้",
            icon: "warning",
            background: "#fefefe",
            color: "#333",
            showCancelButton: true,
            confirmButtonText: "📅 ไปหน้านัดหมาย",
            cancelButtonText: "✅ ไปยืนยันตัวตน",
            reverseButtons: true,
            allowOutsideClick: false,
            customClass: {
              popup: "rounded-2xl shadow-lg p-6",
              confirmButton:
                "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg mx-2",
              cancelButton:
                "bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg mx-2",
              title: "text-xl font-bold text-gray-800",
              htmlContainer: "text-gray-600",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/user/appointmentstatus", { replace: true });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              navigate("/user/verifyusertoblockchain", { replace: true });
            }
          });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, location]);

  if (loading) return <div>Loading...</div>;
  if (!isVerified) return null;
  return children;
};

// ✅ ต้อง login แต่ไม่บังคับ verify
const SemiProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLogin = localStorage.getItem("isLogin") === "true";

    if (!token || !isLogin) {
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login", { replace: true });
      return;
    }

    fetch("/api/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("isLogin");
          navigate("/login", { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, location]);

  if (loading) return <div>Loading...</div>;
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

            <Chat   />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "chat/:roomID", 
        element: (
          <ProtectedRoute>
            <Chat   />
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
          <SemiProtectedRoute>
            <SellPostMain />
          </SemiProtectedRoute>
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
          <SemiProtectedRoute>
            <VerifyUser />
          </SemiProtectedRoute>
        )
      },
      {
        path: "userdashboard",
        element: (
          <SemiProtectedRoute>
            <UserDashboard />
          </SemiProtectedRoute>
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
          <SemiProtectedRoute>
            <AppointmentStatus />
          </SemiProtectedRoute>
        ) 
      },
      { 
        path: "landhistory", 
        element: (
          <ProtectedRoute>
            <History />
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



