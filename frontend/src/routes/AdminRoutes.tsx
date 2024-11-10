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
const CreateStore = Loadable(lazy(() => import("../pages/Store/create")));

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
                children: [
                    {
                        path: "",
                        element: <Store />,
                    },
                    {
                        path: "create",
                        element: <CreateStore />,
                    },
                    {
                        path: "edit/:id",
                        element: <EditStore />,
                    },
                ],
            },
        ],
    };
};

export default AdminRoutes;
