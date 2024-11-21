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
    GetStoreByID,
    GetAllStoreImage,
    GetAllService,
    UpdateStore,
    UpdateService,
    CreateService,
    CreateStoreImage,
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
                console.log("storeResponse:", storeResponse);
    
                if (storeResponse?.data) {
                    setStoreData(storeResponse.data);
    
                    setTimeout(() => {
                        form.setFieldsValue({
                            name: storeResponse.data.name,
                            location: storeResponse.data.location,
                            contact_info: storeResponse.data.contact_info,
                            description: storeResponse.data.description,
                            time_open: moment(storeResponse.data.time_open, "HH:mm"),
                            status: storeResponse.data.status,
                        });
                    }, 0);
                }
    
                // Fetch store images
                const storeImagesResponse = await GetAllStoreImage();
                console.log("storeImagesResponse:", storeImagesResponse);
    
                if (storeImagesResponse?.data?.data && Array.isArray(storeImagesResponse.data.data)) {
                    const filteredImages = storeImagesResponse.data.data.filter(
                        (img) => img.store_id === parseInt(id!)
                    );
                    setStoreImages(filteredImages);
                } else {
                    console.warn("storeImagesResponse.data.data is not an array.");
                    setStoreImages([]);
                }
    
                // Fetch services
                const servicesResponse = await GetAllService();
                console.log("servicesResponse:", servicesResponse);
    
                if (servicesResponse?.data?.data && Array.isArray(servicesResponse.data.data)) {
                    const filteredServices = servicesResponse.data.data.filter(
                        (svc) => svc.store_id === parseInt(id!)
                    );
                    setServices(filteredServices);
                } else {
                    console.warn("servicesResponse.data.data is not an array.");
                    setServices([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                messageApi.error("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };
    
        fetchStoreDetails();
    }, [id, form, messageApi]);
    
    
    

    const handleBeforeUpload = (file: File) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
        }
        return isImage || Upload.LIST_IGNORE;
    };

    const handleChangeImage = ({ fileList }: any) => {
        setStoreImages(
            fileList.map((file: any) => ({
                id: file.uid,
                image_url: file.url || URL.createObjectURL(file.originFileObj),
                originFileObj: file.originFileObj, // เก็บไฟล์ไว้สำหรับอัปโหลด
            }))
        );
    };

    const addService = () => {
        setServices([...services, { id: 0, name_service: "", price: 0, duration: 0, store_id: parseInt(id!) }]);
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const onFinish = async (values: any) => {
        try {
            const updatedStore = { ...values, time_open: values.time_open.format("HH:mm") };
    
            // อัปเดตร้านค้า
            await UpdateStore(id, updatedStore);
    
            // อัปเดตหรือสร้างบริการ
            for (const service of services) {
                if (service.id) {
                    // หากมี `id` ให้ทำการอัปเดต
                    await UpdateService(service.id, service);
                } else {
                    // หากไม่มี `id` ให้ทำการสร้างใหม่
                    await CreateService({ ...service, store_id: parseInt(id!) });
                }
            }
    
            // ลบรูปภาพเก่าที่ไม่มีในรายการ
            const existingImageIDs = storeImages.filter((img) => img.ID).map((img) => img.ID);
            const currentImages = await GetAllStoreImage(); // ดึงรูปภาพทั้งหมด
            const toDelete = currentImages.data.data.filter(
                (img: any) => img.store_id === parseInt(id!) && !existingImageIDs.includes(img.ID)
            );
            for (const img of toDelete) {
                // ลบรูปภาพเก่าที่ไม่ถูกเก็บใน `storeImages`
                await DeleteStoreImage(img.ID);
            }
    
            // อัปโหลดหรือสร้างรูปภาพใหม่
            for (const image of storeImages) {
                if (!image.ID) {
                    const formData = new FormData();
                    formData.append("store_id", id!);
                    formData.append("image", image.originFileObj);
                    await CreateStoreImage(formData);
                }
            }
    
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

                {/* ฟอร์มข้อมูลร้านค้า */}
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

                <Button type="dashed" onClick={addService} block icon={<PlusOutlined />}>
                    Add Service
                </Button>

                <Divider />
                <Button type="primary" htmlType="submit">
                    Save Changes
                </Button>
            </Form>
        </>
    );
}

export default StoreEdit;
