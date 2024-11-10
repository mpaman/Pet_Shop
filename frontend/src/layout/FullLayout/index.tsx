import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Avatar, Button, message, Breadcrumb, Layout } from "antd";
import { UserOutlined, HomeOutlined, PlusOutlined, BookOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.jpg";
import Store from "../../pages/Store/index";
import EditStore from "../../pages/Store/edit";
import CreateStore from "../../pages/Store/create";
import Home from "../../pages/Home";

const { Header, Content, Footer } = Layout;

const FullLayout: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [profile, setProfile] = useState<any>(null);

    const Logout = () => {
        localStorage.clear();
        messageApi.success("Logout successful");
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    };

    return (
        <Layout style={{ minHeight: "100vh", position: "relative" }}>
            {contextHolder}

            <Layout style={{ position: "relative", zIndex: 1 }}>
                <Header
                    style={{
                        background: "Black",
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
                        <h1 style={{ color: "white", margin: "0 10px" }}>PET</h1>
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
                                <BookOutlined style={{ color: "white" }} />
                                <span> ข้อมูลร้านค้า</span>
                            </Link>
                        </Button>


                        <Link to="/customer">
                            <Avatar
                                style={{
                                    backgroundColor: "#1890ff",
                                    marginLeft: "20px",
                                    cursor: "pointer",
                                }}
                                icon={<UserOutlined />}
                            />
                        </Link>

                        <Button type="primary" onClick={Logout} style={{ marginLeft: "20px" }}>
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
                            <Route path="/store/:id/edit" element={<EditStore />} />
                        </Routes>
                    </div>
                </Content>

                <Footer style={{ textAlign: "center" }}>Petshop.com</Footer>
            </Layout>
        </Layout>
    );
};

export default FullLayout;
