import {
    Button,
    Card,
    Form,
    Input,
    message,
    Row,
    Col,
    InputNumber,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersInterface } from "../../../interfaces/IUser";
import logo from "../../../assets/logo.jpg";
import { CreateUser } from "../../../services/https";

function SignUpPages() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: UsersInterface) => {
        let res = await CreateUser(values);
        if (res.status == 201) {
            messageApi.open({
                type: "success",
                content: res.data.message,
            });
            setTimeout(function () {
                navigate("/");
            }, 2000);
        } else {
            messageApi.open({
                type: "error",
                content: res.data.error,
            });
        }
    };

    return (
        <>
            {contextHolder}
            <Row justify="center" align="middle" style={{ height: "100vh", background: "#f0f2f5" }}>
                <Col xs={24} sm={20} md={16} lg={12} xl={8}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: "15px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <img src={logo} alt="Logo" style={{ width: "20%", marginBottom: "0px" }} />
                            <h2 style={{ marginBottom: "20px" }}>Sign Up</h2>
                        </div>
                        <Form
                            name="basic"
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Row gutter={[16, 16]}>
                                {/* First Name */}
                                <Col span={24}>
                                    <Form.Item
                                        label="ชื่อจริง"
                                        name="first_name"
                                        rules={[{ required: true, message: "กรุณากรอกชื่อ !" }]}
                                    >
                                        <Input placeholder="กรุณากรอกชื่อจริง" />
                                    </Form.Item>
                                </Col>

                                {/* Last Name */}
                                <Col span={24}>
                                    <Form.Item
                                        label="นามสกุล"
                                        name="last_name"
                                        rules={[{ required: true, message: "กรุณากรอกนามสกุล !" }]}
                                    >
                                        <Input placeholder="กรุณากรอกนามสกุล" />
                                    </Form.Item>
                                </Col>

                                {/* Email */}
                                <Col span={24}>
                                    <Form.Item
                                        label="อีเมล"
                                        name="email"
                                        rules={[
                                            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
                                            { required: true, message: "กรุณากรอกอีเมล !" },
                                        ]}
                                    >
                                        <Input placeholder="กรุณากรอกอีเมล" />
                                    </Form.Item>
                                </Col>

                                {/* Password */}
                                <Col span={12}>
                                    <Form.Item
                                        label="รหัสผ่าน"
                                        name="password"
                                        rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}
                                    >
                                        <Input.Password placeholder="กรุณากรอกรหัสผ่าน" />
                                    </Form.Item>
                                </Col>

                                {/* Age */}
                                <Col span={12}>
                                    <Form.Item
                                        label="อายุ"
                                        name="age"
                                        rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}
                                    >
                                        <InputNumber min={0} max={99} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>

                                {/* Address */}
                                <Col span={24}>
                                    <Form.Item
                                        label="ที่อยู่"
                                        name="address"
                                        rules={[{ required: true, message: "กรุณากรอกที่อยู่ !" }]}
                                    >
                                        <Input placeholder="กรุณากรอกที่อยู่" />
                                    </Form.Item>
                                </Col>

                                {/* Submit Button */}
                                <Col span={24}>
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            style={{
                                                backgroundColor: "#1890ff",
                                                borderRadius: "10px",
                                                fontSize: "16px",
                                            }}
                                        >
                                            Sign Up
                                        </Button>
                                        <p style={{ textAlign: "center", marginTop: "10px" }}>
                                            หรือ <a onClick={() => navigate("/")}>เข้าสู่ระบบ</a>
                                        </p>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default SignUpPages;
