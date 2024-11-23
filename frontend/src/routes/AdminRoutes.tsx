import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import FullLayout from "../layout/FullLayout";

// Authentication and main pages
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const Home = Loadable(lazy(() => import("../pages/Home")));

// Store-related pages
const Store = Loadable(lazy(() => import("../pages/Store")));
const EditStore = Loadable(lazy(() => import("../pages/Store/edit")));
const EditService = Loadable(lazy(() => import("../pages/Store/edit/service/index")));
const CreateStore = Loadable(lazy(() => import("../pages/Store/create")));

const  Instore = Loadable(lazy(() => import("../pages/Instore")));
const  BookingStore = Loadable(lazy(() => import("../pages/BookingStore")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
    return {
        path: "/",
        element: isLoggedIn ? <FullLayout /> : <MainPages />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "store",
                element: <Store />,
                children: [
                    {
                        path: "create",
                        element: <CreateStore />,
                    },
                    {
                        path: "edit/:id",
                        element: <EditStore />,
                    },
                    {
                        path: "edit/service/:id",
                        element: <EditService />,
                    },
                ],
            },
            {
                path: "stores/:storeId",
                element: <Instore />
            },
            {
                path: "stores/:storeId/booking",
                element: <BookingStore />
            }
            
        ],
    };
};

export default AdminRoutes;
