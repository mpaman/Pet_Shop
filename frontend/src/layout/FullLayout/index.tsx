import React, { useState } from "react";
import { Layout, Button, message, Breadcrumb, Avatar } from "antd";
import { UserOutlined, HomeOutlined, BookOutlined } from "@ant-design/icons";
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
const { Header, Content, Footer } = Layout;

const FullLayout: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [profile, setProfile] = useState<any>(null);
    const navigate = useNavigate();

    const Logout = () => {
        localStorage.clear();
        messageApi.success("Logout successful");
        setTimeout(() => {
            navigate("/");
        }, 2000);
    };

    return (
        <Layout style={{ minHeight: "100vh", position: "relative" }}>
            {contextHolder}

            <Layout style={{ position: "relative", zIndex: 1 }}>
                <Header
                    style={{
                        background: "#775342",
                        padding: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img src={logo} alt="Logo" style={{ width: 50, margin: "0 10px" }} />
                        <h1 style={{ color: "white", margin: "0 10px" }}>PETSHOP</h1>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                        <Button type="text" style={{ color: "white", margin: "0 20px" }}>
                            <Link to="/">
                                <HomeOutlined style={{ color: "white" }} />
                                <span> หน้าหลัก</span>
                            </Link>
                        </Button>

                        <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                            <Link to="/store">

                                <span> ข้อมูลร้านค้า</span>
                            </Link>
                        </Button>

                        <Button type="text" style={{ color: "white", margin: "0 10px" }}>
                            <Link to="/totalbooking">

                                <span> booking</span>
                            </Link>
                        </Button>



                        <Button onClick={Logout} style={{ marginLeft: "20px",background:"#EDC8AE" }}>
                            ออกจากระบบ
                        </Button>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: "0",
                        padding: "16px",
                        background: "#FFFFFF",
                        minHeight: "calc(100vh - 80px - 64px)",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Breadcrumb style={{ margin: "16px 0" }} />
                    <div style={{ padding: 24, minHeight: "100%", background: "rgba(240, 242, 245, 0.8)" }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/store" element={<Store />} />
                            <Route path="/store/create" element={<CreateStore />} />
                            <Route path="/store/edit/:id" element={<EditStore />} />
                            <Route path="/store/edit/service/:id" element={<EditService />} />
                            <Route path="/store/booking/:id" element={<Booking />} />

                            <Route path="/stores/:storeId" element={<Instore />} />
                            <Route path="/stores/:storeId/booking" element={<BookingStore />} />
                            <Route path="/totalbooking" element={<TotalBooking />} />
                        </Routes>
                    </div>
                </Content>

                {/* <Footer style={{ textAlign: "center" }}>Petshop.com</Footer> */}
            </Layout>
        </Layout>
    );
};

export default FullLayout;
