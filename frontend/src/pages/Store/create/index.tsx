import React, { useState } from 'react';
import { Form, Input, Button, Select, TimePicker, Upload, message, InputNumber, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { CreateStore as CreateNewStore, CreateStoreImage, CreateService } from '../../../services/https';

const { TextArea } = Input;
const { Option } = Select;

// List of provinces in Thailand
const provinces = [
    "กรุงเทพมหานคร", "เชียงใหม่", "เชียงราย", "ชลบุรี", "กระบี่", "ภูเก็ต",
    "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "ขอนแก่น", "สุราษฎร์ธานี",
    "ระยอง", "นครราชสีมา", "พระนครศรีอยุธยา", "อุดรธานี", "สงขลา",
    "ตรัง", "ลำปาง", "ราชบุรี", "ประจวบคีรีขันธ์", "นราธิวาส"
];

function CreateStore() {
    const [storeImages, setStoreImages] = useState([]);
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    // Add a new service
    const addService = () => {
        setServices([...services, { 
            price: 0, 
            duration: 0, 
            name_service: '', 
            category_pet: '', 
            description: '' 
        }]);
    };

    // Remove an image
    const handleRemoveImage = (file) => {
        setStoreImages(storeImages.filter((image) => image.uid !== file.uid));
        message.success("Image removed successfully");
    };

    // Remove a service
    const handleRemoveService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    // Handle form submission
    const onFinish = async (values) => {
        try {
            const storeData = {
                name: values.name,
                location: values.location,
                address: values.address,
                contact_info: values.contact_info,
                description: values.description,
                time_open: values.time_open.format("HH:mm"),
                time_close: values.time_close.format("HH:mm"),
                status: values.status,
            };

            const response = await CreateNewStore(storeData);
            if (response.status === 201) {
                const storeId = response.data.store_id;

                // Upload images
                await Promise.all(storeImages.map((file) => CreateStoreImage({ store_id: storeId, image_url: file.url })));

                // Upload services
                await Promise.all(
                    services.map((service) =>
                        CreateService({
                            store_id: storeId,
                            name_service: service.name_service,
                            category_pet: service.category_pet,
                            description: service.description,
                            duration: service.duration,
                            price: service.price,
                        })
                    )
                );

                message.success("Store created successfully!");
                navigate(`/store`);
            }
        } catch (error) {
            message.error("Failed to create store");
            console.error(error);
        }
    };

    // Handle image upload
    const handleChangeImage = ({ fileList }) => {
        const processedFiles = fileList.map((file) => {
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

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <h2>Create Store</h2>
            <Form.Item label="Store Name" name="name" rules={[{ required: true, message: 'Please input the store name!' }]}>
                <Input placeholder="Enter store name" />
            </Form.Item>

            <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please select the location!' }]}>
                <Select
                    showSearch
                    placeholder="Select a province"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {provinces.map((province) => (
                        <Option key={province} value={province}>{province}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please input the address!' }]}>
                <Input placeholder="Enter detailed address" />
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

            <Form.Item label="Closing Time" name="time_close" rules={[{ required: true, message: 'Please select closing time!' }]}>
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
            <h3>Upload Images</h3>
            <Upload
                listType="picture-card"
                fileList={storeImages}
                onChange={handleChangeImage}
                onRemove={handleRemoveImage}
            >
                {storeImages.length < 5 && (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                )}
            </Upload>

            <Divider />
            <h3>Store Services</h3>
            {services.map((service, index) => (
                <Row key={index} gutter={16}>
                    <Col span={6}>
                        <Form.Item label={`Service Name ${index + 1}`}>
                            <Input
                                value={service.name_service}
                                onChange={(e) =>
                                    setServices(services.map((s, i) => i === index ? { ...s, name_service: e.target.value } : s))
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="Pet Category">
                            <Select
                                value={service.category_pet}
                                onChange={(value) =>
                                    setServices(services.map((s, i) => i === index ? { ...s, category_pet: value } : s))
                                }
                            >
                                <Option value="dog">Dog</Option>
                                <Option value="cat">Cat</Option>
                                {/* <Option value="bird">Bird</Option>
                                <Option value="other">Other</Option> */}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
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
                    <Col span={4}>
                        <Form.Item label="Price">
                            <InputNumber
                                min={0}
                                value={service.price}
                                onChange={(value) =>
                                    setServices(services.map((s, i) => i === index ? { ...s, price: value } : s))
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Button
                            type="danger"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveService(index)}
                        >
                            Remove
                        </Button>
                    </Col>
                </Row>
            ))}
            <Button onClick={addService} icon={<PlusOutlined />}>
                Add Service
            </Button>

            <Divider />
            <Button type="primary" htmlType="submit">
                Create Store
            </Button>
        </Form>
    );
}

export default CreateStore;
