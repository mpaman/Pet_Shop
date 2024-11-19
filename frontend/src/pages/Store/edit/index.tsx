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
import { StoreInterface } from "../../../interfaces/Store";
import { StoreImageInterface } from "../../../interfaces/Storeimage";
import { ServiceInterface } from "../../../interfaces/Service";
import {
    // GetStoreByID,
    GetStoreImagesByStoreID,
    GetServiceByStoreID,
    UpdateStore,
    UpdateService,
    UpdateStoreImage,
    UploadNewImage,
    CreateService,  // Make sure UploadNewImage is imported here
} from "../../../services/https";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [storeData, setStoreData] = useState<StoreInterface | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            setLoading(true);
            try {
                // Fetch store details
                const storeResponse = await GetStoreByID(id);
                const storeImagesResponse = await GetStoreImagesByStoreID(id);
                const servicesResponse = await GetServiceByStoreID(id);

                if (storeResponse.data) {
                    setStoreData(storeResponse.data);
                    setStoreImages(storeImagesResponse.data || []);
                    setServices(servicesResponse.data || []);

                    // Set form fields
                    form.setFieldsValue({
                        name: storeResponse.data.name,
                        location: storeResponse.data.location,
                        contact_info: storeResponse.data.contact_info,
                        description: storeResponse.data.description,
                        time_open: moment(storeResponse.data.time_open, "HH:mm"),
                        status: storeResponse.data.status,
                    });
                } else {
                    messageApi.error("Store not found!");
                    navigate("/store");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                messageApi.error("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };

        fetchStoreDetails();
    }, [id, form, messageApi, navigate]);

    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
        }
        return isImage;
    };

    const handleChangeImage = ({ fileList }: any) => {
        setStoreImages(
            fileList.map((file: any) => ({
                id: file.uid,
                image_url: file.url || URL.createObjectURL(file.originFileObj),
            }))
        );
    };

    const addService = () => {
        setServices([
            ...services,
            { id: 0, name: "", price: 0, duration: 0, store_id: parseInt(id!) },
        ]);
    };

    const removeService = (index: number) => {
        const newServices = services.filter((_, i) => i !== index);
        setServices(newServices);
    };

    const onFinish = async (values: any) => {
        try {
            // Update store
            const updatedStoreData = { ...values, time_open: values.time_open.format("HH:mm") };
            await UpdateStore(id, updatedStoreData);

            // Update services
            const servicePromises = services.map((service) =>
                service.id ? UpdateService(service.id, service) : UpdateService(service.id, service)
            );

            // Upload new images
            const imagePromises = storeImages.map((image) => {
                if (image.id) {
                    return UpdateStoreImage(image.KD, image);
                }

                // Image is new, so upload it
                const formData = new FormData();
                formData.append("store_id", id);
                formData.append("image", image.originFileObj);  // Use originFileObj for new images
                return UploadNewImage(formData);
            });

            await Promise.all([...servicePromises, ...imagePromises]);

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
        <>
            {contextHolder}
            <Form layout="vertical" onFinish={onFinish} form={form}>
                <h2>Edit Store</h2>

                {/* Form Fields */}
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
                        fileList={storeImages.map((image) => ({
                            uid: image.ID,
                            url: image.image_url,
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
                </Form.Item>

                <Divider />
                <h3>Store Services</h3>
                {services.map((service, index) => (
                    <Row key={index} gutter={16} style={{ marginBottom: 10 }}>
                        <Col span={8}>
                            <Form.Item label={`Service Name ${index + 1}`}>
                                <Input
                                    placeholder="Service Name"
                                    value={service.name_service}
                                    onChange={(e) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].name_service = e.target.value;
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
                                    style={{ width: "100%" }}
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
                                    style={{ width: "100%" }}
                                    value={service.duration}
                                    onChange={(value) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].duration = value || 0;
                                        setServices(updatedServices);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Button type="danger" onClick={() => removeService(index)}>
                                Remove
                            </Button>
                        </Col>
                    </Row>
                ))}

                <Button type="dashed" onClick={addService} style={{ width: "100%", marginTop: "10px" }}>
                    <PlusOutlined /> Add Service
                </Button>

                <Divider />
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default StoreEdit;
