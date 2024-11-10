import { useEffect } from "react";
import {
    Space,
    Button,
    Col,
    Row,
    Divider,
    Form,
    Input,
    Card,
    message,
    InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { StoreInterface } from "../../../interfaces/Store"; // Adjusted to Store interface
import { GetStoreById, UpdateStoreById } from "../../../services/https"; // Adjusted to store services
import { useNavigate, Link, useParams } from "react-router-dom";

function StoreEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const getStoreById = async (id: string) => {
        let res = await GetStoreById(id);

        if (res.status === 200) {
            form.setFieldsValue({
                store_id: res.data.store_id,
                info: res.data.info,
                contact: res.data.contact,
                category: res.data.category,
            });
        } else {
            messageApi.open({
                type: "error",
                content: "ไม่พบข้อมูลร้านค้า",
            });
            setTimeout(() => {
                navigate("/store");
            }, 2000);
        }
    };

    const onFinish = async (values: StoreInterface) => {
        const res = await UpdateStoreById(id!, values);

        if (res.status === 200) {
            messageApi.open({
                type: "success",
                content: "บันทึกข้อมูลร้านค้าสำเร็จ",
            });
            setTimeout(() => {
                navigate("/store");
            }, 2000);
        } else {
            messageApi.open({
                type: "error",
                content: res.data.error,
            });
        }
    };

    useEffect(() => {
        if (id) {
            getStoreById(id);
        }
    }, [id]);

    return (
        <div style={{ padding: "20px" }}>
            {contextHolder}
            <Row justify="center" style={{ marginBottom: "20px" }}>
                <Col span={24}>
                    <h2 style={{ textAlign: "center" }}>แก้ไขข้อมูลร้านค้า</h2>
                </Col>
            </Row>
            <Divider />
            <Card bordered={false} style={{ maxWidth: "800px", margin: "auto" }}>
                <Form
                    name="store-edit"
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={[16, 24]}>
                        <Col span={24}>
                            <Form.Item
                                label="รายละเอียดร้านค้า"
                                name="info"
                                rules={[{ required: true, message: "กรุณากรอกรายละเอียดร้านค้า!" }]}
                            >
                                <Input.TextArea
                                    style={{ width: "100%", height: "200px" }}
                                    placeholder="กรุณากรอกรายละเอียดร้านค้า"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="ข้อมูลการติดต่อ"
                                name="contact"
                                rules={[{ required: true, message: "กรุณากรอกข้อมูลการติดต่อ!" }]}
                            >
                                <Input placeholder="กรุณากรอกข้อมูลการติดต่อ" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="หมวดหมู่"
                                name="category"
                                rules={[{ required: true, message: "กรุณากรอกหมวดหมู่!" }]}
                            >
                                <Input placeholder="กรุณากรอกหมวดหมู่" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row justify="end" style={{ marginTop: "20px" }}>
                        <Col>
                            <Form.Item>
                                <Space>
                                    <Link to="/store">
                                        <Button htmlType="button" style={{ marginRight: "10px" }}>
                                            ยกเลิก
                                        </Button>
                                    </Link>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<PlusOutlined />}
                                    >
                                        บันทึก
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}

export default StoreEdit;
