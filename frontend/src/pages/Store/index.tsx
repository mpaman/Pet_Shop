import React, { useState } from 'react';
import { Form, Input, Button, Select, TimePicker, Upload, message, InputNumber, Divider, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { CreateStoreImage, CreateService, CreateStore as CreateNewStore } from '../../services/https'; // เปลี่ยนชื่อที่นี่

const { TextArea } = Input;
const { Option } = Select;

interface StoreService {
    name: string;
    price: number;
    duration: number;
}

function CreateStore() {  // ชื่อฟังก์ชันที่ใช้ภายในไฟล์
    const [storeImages, setStoreImages] = useState<UploadFile[]>([]);
    const [services, setServices] = useState<StoreService[]>([]);

    const addService = () => {
        setServices([...services, { name: '', price: 0, duration: 0 }]);
    };

    const onFinish = async (values: any) => {
        const storeData = {
            Name: values.name,
            Location: values.location,
            ContactInfo: values.contact_info,
            Description: values.description,
            TimeOpen: values.time_open.format("HH:mm"),
            Status: values.status,
            UserownID: 1, // เปลี่ยนเป็น ID ของผู้ใช้ปัจจุบันที่รับจาก session
        };

        try {
            const response = await CreateNewStore(storeData); // ใช้ CreateNewStore แทน
            if (response.status === 200) {
                message.success("Store created successfully!");

                const storeID = response.data.ID;

                // บันทึกรูปภาพ
                const uploadPromises = storeImages.map((file) =>
                    CreateStoreImage({ StoreID: storeID, ImageUrl: file.url })
                );
                await Promise.all(uploadPromises);

                // บันทึกข้อมูลบริการ
                const servicePromises = services.map((service) =>
                    CreateService({ StoreID: storeID, Nameservice: service.name, Price: service.price, Duration: service.duration })
                );
                await Promise.all(servicePromises);

                message.success("Store, images, and services saved successfully!");
            }
        } catch (error) {
            message.error("Failed to create store");
            console.error(error);
        }
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
                    onChange={({ fileList }) => setStoreImages(fileList)}
                    beforeUpload={() => false}
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
