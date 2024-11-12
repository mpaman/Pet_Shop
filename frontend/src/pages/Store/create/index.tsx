import React, { useState } from 'react';
import { Form, Input, Button, Select, TimePicker, Upload, message, InputNumber, Divider, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { StoreImageInterface } from "../../../interfaces/Storeimage";
import { ServiceInterface } from "../../../interfaces/Service";
import { CreateStoreImage, CreateService, CreateStore as CreateNewStore } from '../../../services/https';

const { TextArea } = Input;
const { Option } = Select;

function CreateStore() {
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [image, setImage] = useState<string | undefined>(undefined);

    // ฟังก์ชันเพิ่มบริการใหม่
    const addService = () => {
        setServices([...services, { name: '', price: 0, duration: 0 }]);
    };

    // ฟังก์ชันสำหรับเมื่อฟอร์มถูกส่ง
    const onFinish = async (values: any) => {
        let payload = {
            ...values,
            picture: image, // use the base64 image
        };

        const storeData = {
            name: values.name,
            location: values.location,
            contact_info: values.contact_info,
            description: values.description,
            time_open: values.time_open.format("HH:mm"),
            status: values.status,
            userown_id: 1, // ระบุ ID ของเจ้าของร้าน (หากไม่มีก็สามารถข้ามได้)
        };

        try {
            const response = await CreateNewStore(storeData);
            if (response.status === 201) {
                const storeId = response.data.store_id; // ดึง store_id จากผลลัพธ์

                message.success("Store created successfully!");

                // อัปโหลดภาพร้าน
                const uploadImagePromises = storeImages.map((file) => {
                    const imageData = {
                        store_id: storeId, // ใช้ store_id ที่สร้างขึ้น
                        image_url: file.url
                    };
                    return CreateStoreImage(imageData);
                });

                await Promise.all(uploadImagePromises);

                // บันทึกบริการสำหรับร้าน
                const servicePromises = services.map((service) => {
                    const serviceData = {
                        store_id: storeId, // ใช้ store_id ที่สร้างขึ้น
                        name_service: service.name,
                        duration: service.duration,
                        price: service.price,
                    };
                    return CreateService(serviceData).catch((error) => {
                        console.error('Error creating service:', error);
                        message.error('Failed to create service');
                    });
                });

                await Promise.all(servicePromises);

                message.success("Store, images, and services saved successfully!");
            }
        } catch (error) {
            message.error("Failed to create store");
            console.error(error);
        }
    };

    // ฟังก์ชันสำหรับอัปโหลดภาพและแปลงเป็น base64
    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
        }
        return isImage;
    };

    const handleChangeImage = async ({ fileList }: any) => {
        const imageList = fileList.map((file: any) => {
            if (file.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => {
                    setStoreImages(fileList.map((item: any) => ({
                        url: reader.result as string
                    })));
                };
            }
            return file;
        });
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <h2>Create Store</h2>

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
                    beforeUpload={handleBeforeUpload} // เช็คประเภทของไฟล์
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
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    Create Store
                </Button>
            </Form.Item>
        </Form>
    );
}

export default CreateStore;
