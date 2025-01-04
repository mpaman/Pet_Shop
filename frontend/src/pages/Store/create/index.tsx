import { useState } from 'react';
import { Form, Input, Button, Select, TimePicker, Upload, message, InputNumber, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { CreateStore as CreateNewStore, CreateStoreImage, CreateService,GetAllservicearea } from '../../../services/https';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import ImgCrop from 'antd-img-crop';
import "./createstore.css";

import { ServiceInterface } from "../../../interfaces/Service";

const { TextArea } = Input;
const { Option } = Select;

// ต้องแก้ เป็นเก็บ แบบ entity
const provinces = [
    "กรุงเทพมหานคร", "เชียงใหม่", "เชียงราย", "ชลบุรี", "กระบี่", "ภูเก็ต",
    "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "ขอนแก่น", "สุราษฎร์ธานี",
    "ระยอง", "นครราชสีมา", "พระนครศรีอยุธยา", "อุดรธานี", "สงขลา",
    "ตรัง", "ลำปาง", "ราชบุรี", "ประจวบคีรีขันธ์", "นราธิวาส"
];

function CreateStore() {
    const [storeImages, setStoreImages] = useState<any[]>([]); // Add appropriate type
    const [services, setServices] = useState<ServiceInterface[]>([]); // Use ServiceInterface[]
    const navigate = useNavigate();
    const [fileList, setFileList] = useState<any[]>([]); // Add appropriate type
    const [latitude, setLatitude] = useState(13.736717); // Default: กรุงเทพฯ
    const [longitude, setLongitude] = useState(100.523186);
    const [messageApi, contextHolder] = message.useMessage();

    const addService = () => {
        setServices([...services, {
            price: 0,
            duration: 0,
            name_service: '',
            category_pet: '',
            store_id: 0
        }]);
    };
    // Add default services
    const addDefaultServices = () => {
        const defaultServices: ServiceInterface[] = [
            {
                store_id: 1, 
                name_service: "บริการกรูมมิ่ง",
                category_pet: "dog",
                duration: 60,
                price: 500,
            },
            {
                store_id: 1, 
                name_service: "อาบน้ำสัตว์เลี้ยง",
                category_pet: "dog",
                duration: 30,
                price: 300,
            },
            {
                store_id: 1, 
                name_service: "ฝากสัตว์เลี้ยง",
                category_pet: "dog",
                duration: 1440, // 1 วัน
                price: 800,
            },
        ];

        setServices([...services, ...defaultServices]);
    };

    const handleRemoveService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const onFinish = async (values: any) => {
        try {
            if (fileList.length === 0) {
                await messageApi.open({
                    className: "error-message", 
                    type: "error", 
                    content: "Please upload a profile image",
                    duration: 3, 
                });
                return;
            }
            if (services.length === 0) {
                await messageApi.open({
                    className: "error-message",
                    type: "error",
                    content: "Please add at least 1 service.",
                    duration: 3,
                });
                return;
            }
            

            const profileImageFile = fileList[0].originFileObj;
            const profileImageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(profileImageFile);
                reader.onload = () => resolve(reader.result as string);  // Ensure the result is treated as a string
                reader.onerror = (error) => reject(error);
            });

            const storeData = {
                user_id: 1, // Example user_id
                name: values.name,
                profile_image: profileImageBase64,
                district: values.district,
                province: values.province,
                description: values.description,
                latitude,
                longitude,
                contact_info: values.contact_info,
                time_open: values.time_open.format("HH:mm"),
                time_close: values.time_close.format("HH:mm"),
                status: values.status,
            };

            console.log("Store Data:", storeData);

            const response = await CreateNewStore(storeData);
            if (response.status === 201) {
                const storeId = response.data.store_id;

                if (storeImages.length > 0) {
                    await Promise.all(
                        storeImages.map((file) =>
                            CreateStoreImage({ store_id: storeId, image_url: file.url })
                        )
                    );
                }

                if (services.length > 0) {
                    await Promise.all(
                        services.map((service) =>
                            CreateService({
                                store_id: storeId,
                                name_service: service.name_service,
                                category_pet: service.category_pet,
                                duration: service.duration,
                                price: service.price,
                            })
                        )
                    );
                }


                await messageApi.open({
                    className: "success-message",
                    type: "success",
                    content: "สร้าง-Store-สำเร็จ",
                    duration: 3,
                });
                navigate(`/store`);
            } else {
                throw new Error("Failed to create store");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Failed to create store");
        }
    };


    const handleChangeImage = ({ fileList }: any) => {
        const processedFiles = fileList.map((file: any) => {
            if (file.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                return new Promise((resolve) => {
                    reader.onload = () => resolve({ uid: file.uid, url: reader.result });
                });
            }
            return file;
        });

        Promise.all(processedFiles).then((results) => setStoreImages(results));
    };

    const onChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

    const handleMapClick = (e: any) => {
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        message.success(`Updated location: Lat ${e.latlng.lat}, Lng ${e.latlng.lng}`);
    };

    const MapClickHandler = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    return (
        <div className="create-store-container" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            {contextHolder}
            <Form layout="vertical" onFinish={onFinish} style={{ width: '100%', maxWidth: '800px' }}>
                <h2>Create Store</h2>
                <Divider />

                <Form.Item label="Profile Image" name="profile_image" >
                    <ImgCrop rotationSlider>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={onChange}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>อัพโหลด</div>
                                </div>
                            )}
                        </Upload>
                    </ImgCrop>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Store Name" name="name" rules={[{ required: true, message: 'Please input the store name!' }]}>
                            <Input placeholder="Enter store name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Province" name="province" rules={[{ required: true, message: 'Please select a province!' }]}>
                            <Select placeholder="Select a province">
                                {provinces.map(province => <Option key={province} value={province}>{province}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="District" name="district" rules={[{ required: true, message: 'Please input the district!' }]}>
                    <Input placeholder="Enter detailed district" />
                </Form.Item>

                <h3>Choose Store Location</h3>

                {/* Map */}
                <div style={{ height: "400px", marginBottom: "20px", border: "1px solid #d9d9d9" }}>
                    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                        />
                        <MapClickHandler />
                        <Marker position={[latitude, longitude]} />
                    </MapContainer>
                </div>

                {/* Latitude & Longitude */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Latitude">
                            <Input value={latitude} readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Longitude">
                            <Input value={longitude} readOnly />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Contact Info" name="contact_info" rules={[{ required: true, message: 'Please input the contact info!' }]}>
                    <Input placeholder="Enter contact information" />
                </Form.Item>

                <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please input the store description!' }]}>
                    <TextArea rows={4} placeholder="Describe the store" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Opening Time" name="time_open" rules={[{ required: true, message: 'Please select opening time!' }]}>
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Closing Time" name="time_close" rules={[{ required: true, message: 'Please select closing time!' }]}>
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select store status!' }]}>
                    <Select placeholder="Select status">
                        <Option value="open">Open</Option>
                        <Option value="close">Close</Option>
                        <Option value="full">Full</Option>
                    </Select>
                </Form.Item>

                <Divider />
                <h3>Upload Images</h3>
                <Upload listType="picture-card" fileList={storeImages} onChange={handleChangeImage} beforeUpload={() => false} maxCount={5}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>อัพโหลด</div>
                    </div>
                </Upload>

                <Divider />
                <h3>Store Services</h3>
                <Button onClick={addDefaultServices} style={{ marginBottom: "10px" }} icon={<PlusOutlined />}>
                    Add Default Services
                </Button>
                {services.map((service, index) => (
                    <Row key={index} gutter={16}>
                        <Col span={6}>
                            <Form.Item label={`Service Name ${index + 1}`} rules={[{ required: true, message: 'Please input Service Name!' }]}>
                                <Input value={service.name_service} onChange={(e) => setServices(services.map((s, i) => i === index ? { ...s, name_service: e.target.value } : s))} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item label="Pet Category" rules={[{ required: true, message: 'Please input store Pet Category!' }]}>
                                <Select value={service.category_pet} onChange={(value) => setServices(services.map((s, i) => i === index ? { ...s, category_pet: value } : s))}>
                                    <Option value="dog">Dog</Option>
                                    <Option value="cat">Cat</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Duration (minutes)" rules={[{ required: true, message: 'Please input store Duration!' }]}>
                                <InputNumber placeholder="Duration" min={1} style={{ width: '100%' }} value={service.duration} onChange={(value) => {
                                    const updatedServices = [...services];
                                    updatedServices[index].duration = value || 0;
                                    setServices(updatedServices);
                                }} />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Price" rules={[{ required: true, message: 'Please input store Price!' }]}>
                                <InputNumber
                                    min={0}
                                    value={service.price ?? 0}
                                    onChange={(value) => setServices(services.map((s, i) => i === index ? { ...s, price: value || 0 } : s))}
                                />

                            </Form.Item>
                        </Col>
                        <Col span={2}>
                            <Button style={{ backgroundColor: 'red', color: 'white' }} icon={<DeleteOutlined />} onClick={() => handleRemoveService(index)} />
                        </Col>
                    </Row>
                ))}

                <Button type="dashed" onClick={addService} icon={<PlusOutlined />}>
                    Add Service
                </Button>



                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Create Store
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default CreateStore;
