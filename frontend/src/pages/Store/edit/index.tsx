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
    Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { StoreImageInterface } from "../../../interfaces/Storeimage";
import { ServiceInterface } from "../../../interfaces/Service";
import {
    GetStoreByID,
    GetStoreImagesByStoreID,
    GetServiceByStoreID,
    UpdateStore,
    UpdateService,
    UpdateStoreImage
} from "../../../services/https";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<any[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [storeData, setStoreData] = useState<any>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
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

                const imagesResponse = await GetStoreImagesByStoreID(id);
                setStoreImages(
                    Array.isArray(imagesResponse.data)
                        ? imagesResponse.data.map((img: any) => ({
                            uid: img.id,
                            url: img.image_url,
                            name: img.image_url,
                        }))
                        : []
                );

                const servicesResponse = await GetServiceByStoreID(id);
                setServices(
                    Array.isArray(servicesResponse.data)
                        ? servicesResponse.data
                        : []
                );
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

    const handleChangeImage = ({ fileList }: any) => {
        setStoreImages(fileList);
    };

    const addService = () => {
        setServices([
            ...services,
            { id: 0, name: "", price: 0, duration: 0, store_id: parseInt(id!) },
        ]);
    };

    const onFinish = async (values: any) => {
        try {
            const updatedData = {
                ...values,
                services: services.map((service) => ({
                    id: service.id || null,
                    name: service.name,
                    price: service.price,
                    duration: service.duration,
                })),
                images: storeImages.map((image) => ({
                    id: image.uid,
                    image_url: image.url,
                })),
            };

            await UpdateStore(id, updatedData);
            messageApi.success("Store updated successfully!");
            navigate(`/store`);
        } catch (error) {
            console.error("Update Error:", error);
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
        <Form layout="vertical" onFinish={onFinish} form={form}>
            <h2>Edit Store</h2>

            <Form.Item label="Store Name" name="name" rules={[{ required: true, message: 'Please input the store name!' }]}>
                <Input placeholder="Enter store name" />
            </Form.Item>

            <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please input the location!' }]}>
                <Input placeholder="Enter location" />
            </Form.Item>

            <Form.Item label="Contact Info" name="contact_info" rules={[{ required: true, message: 'Please input the contact info!' }]}>
                <Input placeholder="Enter contact information" />
            </Form.Item>

            <Form.Item label="Description" name="description">
                <TextArea rows={4} placeholder="Describe the store" />
            </Form.Item>

            <Form.Item label="Opening Time" name="time_open" rules={[{ required: true, message: 'Please select opening time!' }]}>
                <TimePicker format="HH:mm" />
            </Form.Item>

            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select store status!' }]}>
                <Select placeholder="Select status">
                    <Option value="open">Open</Option>
                    <Option value="close">Close</Option>
                    <Option value="full">Full</Option>
                </Select>
            </Form.Item>

            <Divider />
            <Form.Item label="Upload Images">
                <Upload
                    listType="picture-card"
                    fileList={storeImages}
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
            </Form.Item>

            <Divider />
            <h3>Store Services</h3>
            {services.map((service, index) => (
                <Row key={index} gutter={16} style={{ marginBottom: 10 }}>
                    <Col span={8}>
                        <Form.Item label={`Service Name ${index + 1}`}>
                            <Input
                                placeholder="Service Name"
                                value={service.name}
                                onChange={(e) => {
                                    const updatedServices = [...services];
                                    updatedServices[index].name = e.target.value;
                                    setServices(updatedServices);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Pet Category">
                            <Select
                                placeholder="Select Pet Category"
                                value={service.category_pet}
                                onChange={(value) => {
                                    const updatedServices = [...services];
                                    updatedServices[index].category_pet = value;
                                    setServices(updatedServices);
                                }}
                            >
                                <Option value="dog">Dog</Option>
                                <Option value="cat">Cat</Option>
                                <Option value="bird">Bird</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Price">
                            <InputNumber
                                placeholder="Price"
                                min={0}
                                style={{ width: '100%' }}
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
                        <Form.Item label="Duration (minutes)">
                            <InputNumber
                                placeholder="Duration"
                                min={1}
                                style={{ width: '100%' }}
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

            <Button type="dashed" onClick={addService} style={{ width: '100%', marginTop: '10px' }}>
                <PlusOutlined /> Add Service
            </Button>

            <Divider />

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Update Store
                </Button>
            </Form.Item>
        </Form>
    );
}

export default StoreEdit;
