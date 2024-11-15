import { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    Upload,
    message,
    InputNumber,
    Divider,
    Row,
    Col,
    Card,
    Space,
    Spin
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { StoreImageInterface } from "../../../interfaces/Storeimage";
import { ServiceInterface } from "../../../interfaces/Service";
import { GetStoreByID, UpdateStore, GetStoreImages, GetStoreServices } from "../../../services/https";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [storeData, setStoreData] = useState<any>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            setLoading(true);
            try {
                const storeResponse = await GetStoreByID(id);
                if (storeResponse.data) {
                    setStoreData(storeResponse.data);
                    form.setFieldsValue({
                        name: storeResponse.data.name,
                        location: storeResponse.data.location,
                        contact_info: storeResponse.data.contact_info,
                        description: storeResponse.data.description,
                        time_open: storeResponse.data.time_open,
                        status: storeResponse.data.status,
                    });
                }

                const imagesResponse = await GetStoreImages(id);
                setStoreImages(Array.isArray(imagesResponse.data) ? imagesResponse.data : []);

                const servicesResponse = await GetStoreServices(id);
                setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
            } catch (error) {
                console.error("Error fetching store data:", error);
                messageApi.error("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };
    
        fetchStoreDetails();
    }, [id, form, messageApi]);

    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
        }
        return isImage;
    };

    const handleChangeImage = ({ fileList = [] }: any) => {
        setStoreImages(fileList.map((file: any) => ({
            url: file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url,
            uid: file.uid,
        })));
    };

    const addService = () => {
        setServices([...services, { name: "", price: 0, duration: 0, store_id: parseInt(id) }]);
    };

    const onFinish = async (values: any) => {
        try {
            // รวมข้อมูล services และ storeImages ในการอัปเดต
            const updatedData = {
                ...values,
                services: services.map(service => ({
                    name: service.name,
                    price: service.price,
                    duration: service.duration
                })),
                images: storeImages.map(image => ({
                    url: image.url
                }))
            };

            await UpdateStore(id, updatedData);
            messageApi.success("Store updated successfully!");
            navigate(`/store/${id}`);
        } catch (error) {
            messageApi.error("Failed to update store");
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Card title="Edit Store" bordered={false}>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item label="Store Name" name="name">
                    <Input />
                </Form.Item>
                <Form.Item label="Location" name="location">
                    <Input />
                </Form.Item>
                <Form.Item label="Contact Info" name="contact_info">
                    <Input />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <TextArea />
                </Form.Item>
                <Form.Item label="Opening Time" name="time_open">
                    <TimePicker format="HH:mm" />
                </Form.Item>
                <Form.Item label="Status" name="status">
                    <Select>
                        <Option value="open">Open</Option>
                        <Option value="close">Close</Option>
                        <Option value="full">Full</Option>
                    </Select>
                </Form.Item>

                <Divider />

                <h3>Store Images</h3>
                <Upload
                    listType="picture-card"
                    fileList={storeImages.map(image => ({
                        uid: image.uid,
                        url: image.url,
                    }))}
                    onChange={handleChangeImage}
                    beforeUpload={handleBeforeUpload}
                >
                    {storeImages.length >= 5 ? null : (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    )}
                </Upload>

                <Divider />

                <h3>Store Services</h3>
                {services.map((service, index) => (
                    <Row key={index} gutter={16} style={{ marginBottom: 10 }}>
                        <Col span={8}>
                            <Form.Item label={`Service Name ${index + 1}`}>
                                <Input
                                    value={service.name}
                                    onChange={(e) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].name = e.target.value;
                                        setServices(updatedServices);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Price">
                                <InputNumber
                                    value={service.price}
                                    onChange={(value) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].price = value || 0;
                                        setServices(updatedServices);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Duration">
                                <InputNumber
                                    value={service.duration}
                                    onChange={(value) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].duration = value || 0;
                                        setServices(updatedServices);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                ))}
                <Button type="dashed" onClick={addService}>
                    <PlusOutlined /> Add Service
                </Button>

                <Divider />

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update Store
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default StoreEdit;
