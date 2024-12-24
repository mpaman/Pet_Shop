import React, { useState } from "react";
import { Layout, Button, message, Breadcrumb} from "antd";
import {  HomeOutlined, BookOutlined, ShopOutlined } from "@ant-design/icons";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
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

const { Header, Content, Footer } = Layout;

const FullLayout: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

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

            <Header
                style={{
                    background: "#775342",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 20px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
            >
                {/* ส่วนที่ 1: โลโก้ */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            width: 50,
                            borderRadius: "50%",
                            marginRight: 10,
                        }}
                    />
                    <h1
                        style={{
                            color: "white",
                            margin: 0,
                            fontWeight: "bold",
                            fontSize: "20px",
                        }}
                    >
                        PETSHOP
                    </h1>
                </div>

                {/* ส่วนที่ 2: เมนูนำทาง */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        flex: 2,
                    }}
                >
                    <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                        <Link to="/">
                            <HomeOutlined
                                style={{
                                    fontSize: "16px",
                                    marginRight: 8,
                                }}
                            />
                            หน้าหลัก
                        </Link>
                    </Button>
                    <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                        <Link to="/store">
                            <ShopOutlined
                                style={{
                                    fontSize: "16px",
                                    marginRight: 8,
                                }}
                            />
                            ข้อมูลร้านค้า
                        </Link>
                    </Button>
                    <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                        <Link to="/totalbooking">
                            <BookOutlined
                                style={{
                                    fontSize: "16px",
                                    marginRight: 8,
                                }}
                            />
                            Booking
                        </Link>
                    </Button>
                    <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                        <Link to="/admin">
                            <BookOutlined
                                style={{
                                    fontSize: "16px",
                                    marginRight: 8,
                                }}
                            />
                            Admin
                        </Link>
                    </Button>
                    <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                        <Link to="/appstore">
                            <BookOutlined
                                style={{
                                    fontSize: "16px",
                                    marginRight: 8,
                                }}
                            />

                            Appstore
                        </Link>
                    </Button>
                </div>

                {/* ส่วนที่ 3: ปุ่ม Logout */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <Button
                        onClick={Logout}
                        style={{
                            background: "#EDC8AE",
                            border: "none",
                            color: "#775342",
                            fontWeight: "bold",
                            borderRadius: "20px",
                            padding: "8px 16px",
                        }}
                    >
                        ออกจากระบบ
                    </Button>
                </div>
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

            <Footer
                style={{
                    textAlign: "center",
                    background: "#775342",
                    color: "white",
                    padding: "10px 20px",
                }}
            >
                © 2024 PETSHOP. All Rights Reserved.
            </Footer>
        </Layout>
    );
};

export default FullLayout;
