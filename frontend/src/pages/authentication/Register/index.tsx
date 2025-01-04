import {
    Button,
    Card,
    Form,
    Input,
    message,
    Row,
    Col,
    InputNumber,
    Upload,
    Select,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { CreateUser } from "../../../services/https";
import { UsersInterface } from "../../../interfaces/IUser";
import logo from "../../../assets/logo.jpg";

function SignUpPages() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState<any[]>([]);

    const onFinish = async (values: UsersInterface) => {
        // Convert image to base64
        const file = fileList[0]?.originFileObj;
        let base64Image: string | null = null;
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                if (reader.result && typeof reader.result === "string") {
                    base64Image = reader.result;
                    const payload = { ...values, profile: base64Image };
                    const res = await CreateUser(payload);

                    if (res.status === 201) {
                        messageApi.success("สมัครสมาชิกสำเร็จ!");
                        setTimeout(() => navigate("/"), 2000);
                    } else {
                        messageApi.error(res.data.error || "เกิดข้อผิดพลาด!");
                    }
                }
            };
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    return (
        <>
            {contextHolder}
            <Row
                justify="center"
                align="middle"
                style={{ height: "100vh", background: "#f0f2f5" }}
            >
                <Col xs={24} sm={20} md={16} lg={12} xl={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: "15px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ width: "20%", marginBottom: "10px" }}
                            />
                            <h2 style={{ marginBottom: "20px" }}>สมัครสมาชิก</h2>
                        </div>
                        <Form
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="ชื่อจริง"
                                        name="first_name"
                                        rules={[
                                            { required: true, message: "กรุณากรอกชื่อ !" },
                                        ]}
                                    >
                                        <Input placeholder="กรุณากรอกชื่อจริง" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="นามสกุล"
                                        name="last_name"
                                        rules={[
                                            { required: true, message: "กรุณากรอกนามสกุล !" },
                                        ]}
                                    >
                                        <Input placeholder="กรุณากรอกนามสกุล" />
                                    </Form.Item>
                                </Col>
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
                                <Col span={12}>
                                    <Form.Item
                                        label="รหัสผ่าน"
                                        name="password"
                                        rules={[
                                            { required: true, message: "กรุณากรอกรหัสผ่าน !" },
                                        ]}
                                    >
                                        <Input.Password placeholder="กรุณากรอกรหัสผ่าน" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="อายุ"
                                        name="age"
                                        rules={[
                                            { required: true, message: "กรุณากรอกอายุ !" },
                                        ]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={120}
                                            style={{ width: "100%" }}
                                            placeholder="กรุณากรอกอายุ"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label="ที่อยู่"
                                        name="address"
                                        rules={[
                                            { required: true, message: "กรุณากรอกที่อยู่ !" },
                                        ]}
                                    >
                                        <Input placeholder="กรุณากรอกที่อยู่" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12}>
                                    <Form.Item
                                        label="Role"
                                        name="role"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select your role!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            defaultValue=""
                                            style={{ width: "100%" }}
                                            options={[
                                                { value: "", label: "Select Role", disabled: true },
                                                { value: "keeper" },
                                                { value: "user" },
                                                { value: "admin" },
                                                { value: "store" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label="รูปประจำตัว"
                                        name="profile"
                                    >
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                listType="picture-card"
                                                fileList={fileList}
                                                onChange={handleUploadChange}
                                                beforeUpload={() => false}
                                                maxCount={1}
                                            >
                                                {fileList.length < 1 && (
                                                    <div>
                                                        <PlusOutlined />
                                                        <div style={{ marginTop: 8 }}>
                                                            อัพโหลด
                                                        </div>
                                                    </div>
                                                )}
                                            </Upload>
                                        </ImgCrop>
                                    </Form.Item>
                                </Col>
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
                                            สมัครสมาชิก
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
