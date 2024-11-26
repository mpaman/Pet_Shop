import { Button, Card, Form, Input, message, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { SignIn } from "../../../services/https";
import { SignInInterface } from "../../../interfaces/SignIn";
import logo from "../../../assets/logo.jpg";
import "../../../App.css"; // เพิ่มไฟล์ CSS เพื่อปรับแต่ง

function SignInPages() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: SignInInterface) => {
        let res = await SignIn(values);
        if (res.status == 200) {
            messageApi.success("Sign-in successful");
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("page", "dashboard");
            localStorage.setItem("token_type", res.data.token_type);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("id", res.data.id);

            setTimeout(() => {
                location.href = "/";
            }, 2000);
        } else {
            messageApi.error(res.data.error);
        }
    };

    return (
        <>
            {contextHolder}
            <div className="login-page">
                <Row justify="center" align="middle" style={{ height: "100vh" }}>
                    <Col xs={24} sm={24} md={12} lg={8} xl={6}>
                        <Card className="card-login" style={{ borderRadius: "10px", padding: "20px" }}>
                            <div className="logo-container">
                                <img alt="logo" src={logo} className="login-logo" />
                            </div>
                            <Form
                                name="basic"
                                onFinish={onFinish}
                                autoComplete="off"
                                layout="vertical"
                                className="login-form"
                            >
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: "กรุณากรอกอีเมล!" }]}
                                >
                                    <Input className="input-field" />
                                </Form.Item>
                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
                                >
                                    <Input.Password className="input-field" />
                                </Form.Item>
                                <Form.Item>
                                    <Button

                                        htmlType="submit"
                                        className="login-form-button"
                                        block
                                    >
                                        Log in
                                    </Button>
                                    <p className="signup-link">
                                        Or <a onClick={() => navigate("/signup")}>signup now!</a>
                                    </p>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default SignInPages;
