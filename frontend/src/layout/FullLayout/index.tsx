import React, { useEffect, useState } from "react";
import { Layout, Button, message, Breadcrumb, Avatar } from "antd";
import { HomeOutlined, BookOutlined, ShopOutlined, UserOutlined } from "@ant-design/icons";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { GetUserProfile } from "../../services/https";
import logo from "../../assets/logo.jpg";
import Store from "../../pages/Store/index";
import EditStore from "../../pages/Store/edit";
import EditService from "../../pages/Store/edit/service";
import CreateStore from "../../pages/Store/create";
import Home from "../../pages/Home";
import Instore from "../../pages/Instore";
import BookingStore from "../../pages/BookingStore";
import TotalBooking from "../../pages/TotalBooking";
import Booking from "../../pages/Store/booking";
import SearchStore from "../../pages/SearchStore";
import Admin from "../../pages/Admin";
import AppStore from "../../pages/AppStore";
import { UsersInterface } from "../../interfaces/IUser";
import './FullLayout.css';
const { Header, Content, Footer } = Layout;

const FullLayout: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [user, setUser] = useState<UsersInterface | null>(null);
    const navigate = useNavigate();

    const getUserProfile = async () => {
        try {
            const res = await GetUserProfile();
            setUser(res);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };
    useEffect(() => {
        getUserProfile();
    }, []);

    const Logout = () => {
        localStorage.clear();
        messageApi.success("ออกจากระบบสำเร็จ!");
        setTimeout(() => {
            navigate("/");
        }, 2000);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {contextHolder}

            <Header className="header">
                {/* Logo Section */}
                <div className="header-logo">
                    <img src={logo} alt="Logo" />
                    <h1>PETSHOP</h1>
                </div>

                {/* ส่วนที่ 2: เมนูนำทาง */}
                <div className="header-menu">
                    <Button type="text">
                        <Link to="/">
                            <HomeOutlined style={{ fontSize: "14px", marginRight: 8 }} />
                            หน้าหลัก
                        </Link>
                    </Button>

                    {user?.role === "store" && (
                        <Button type="text">
                            <Link to="/store">
                                <ShopOutlined style={{ fontSize: "14px", marginRight: 8 }} />
                                ข้อมูลร้านค้า
                            </Link>
                        </Button>
                    )}

                    {user?.role === "user" && (
                        <Button type="text">
                            <Link to="/totalbooking">
                                <BookOutlined style={{ fontSize: "14px", marginRight: 8 }} />
                                Booking
                            </Link>
                        </Button>
                    )}

                    {user?.role === "admin" && (
                        <Button type="text">
                            <Link to="/admin">
                                <BookOutlined style={{ fontSize: "14px", marginRight: 8 }} />
                                Admin
                            </Link>
                        </Button>
                    )}

                    {user?.role === "user" && (
                        <Button type="text">
                            <Link to="/appstore">
                                <BookOutlined style={{ fontSize: "14px", marginRight: 8 }} />
                                Appstore
                            </Link>
                        </Button>
                    )}
                </div>


                {/* ส่วนที่ 3: ปุ่ม Logout */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: 20,
                    }}
                >
                    {user && (
                        <>
                            <Avatar
                                src={user.Profile || "https://via.placeholder.com/150"}
                                icon={!user.Profile ? <UserOutlined /> : undefined}
                                style={{ marginRight: 10 }}
                            />
                            <span style={{ color: "white" }}>
                                {user.first_name || "ไม่พบข้อมูล"} {user.last_name || ""}
                            </span>
                        </>
                    )}
                </div>

                <Button
                    onClick={Logout}
                    className="logout-button"
                >
                    ออกจากระบบ
                </Button>

            </Header>

            <Content style={{ margin: 0, padding: "20px", background: "#FFFFFF" }}>
                <Breadcrumb style={{ margin: "16px 0", fontSize: "14px", color: "#8c8c8c" }}>
                </Breadcrumb>
                <div
                    style={{
                        padding: 24,
                        minHeight: "calc(100vh - 140px)",
                        background: "rgba(240, 242, 245, 0.8)",
                        borderRadius: "8px",
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/stores" element={<SearchStore />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/store/create" element={<CreateStore />} />
                        <Route path="/store/edit/:id" element={<EditStore />} />
                        <Route path="/store/edit/service/:id" element={<EditService />} />
                        <Route path="/store/booking/:id" element={<Booking />} />
                        <Route path="/stores/:storeId" element={<Instore />} />
                        <Route path="/stores/:storeId/booking" element={<BookingStore />} />
                        <Route path="/totalbooking" element={<TotalBooking />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/appstore" element={<AppStore />} />
                    </Routes>
                </div>
            </Content>

            <Footer className="footer">
                © 2024 PETSHOP. All Rights Reserved.
            </Footer>
        </Layout>
    );
};

export default FullLayout;
