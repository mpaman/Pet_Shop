import React, { useState, useEffect } from "react";
import { Card, Avatar, Space, message, Typography, Divider, List, Row, Col, Image, Button } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { GetStoreByID, GetAllService, GetAllStoreImage } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { StoreImageInterface } from "../../interfaces/Storeimage";
import "../../App.css";

const { Title, Paragraph } = Typography;

const StorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<StoreInterface | null>(null);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]); // เพิ่มสถานะสำหรับเก็บข้อมูล StoreImage
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // ดึงข้อมูลร้านค้า
                const storeResponse = await GetStoreByID(storeId);
                setStore(storeResponse.data);

                // ดึงข้อมูลบริการทั้งหมด
                const serviceResponse = await GetAllService();
                console.log("Full Service Response:", serviceResponse);

                // เข้าถึงฟิลด์ data.data และตรวจสอบว่าเป็น array หรือไม่
                const allServices = Array.isArray(serviceResponse.data?.data) ? serviceResponse.data.data : [];
                console.log("All Services:", allServices);

                // กรองเฉพาะบริการที่ตรงกับ store_id
                const filteredServices = allServices.filter(
                    (service) => service.store_id === Number(storeId)
                );

                setServices(filteredServices);

                // ดึงข้อมูล StoreImage สำหรับ storeId นี้
                const imageResponse = await GetAllStoreImage();
                console.log("Store Image Response:", imageResponse);

                // ตรวจสอบว่า imageResponse.data เป็น array หรือไม่
                if (Array.isArray(imageResponse.data?.data)) { // แก้ไขให้ดึงข้อมูลจาก imageResponse.data.data
                    // กรองข้อมูล StoreImage ที่ตรงกับ storeId
                    const filteredStoreImages = imageResponse.data.data.filter(  // ใช้ imageResponse.data.data
                        (image: { store_id: number }) => image.store_id === Number(storeId)
                    );

                    // เพิ่มการแสดงผลข้อมูล store_id ที่กรองแล้ว
                    console.log("Filtered Store Images:", filteredStoreImages);

                    setStoreImages(filteredStoreImages);
                } else {
                    console.error("Invalid response structure for store images");
                    message.error("Failed to load store images.");
                }

            } catch (error) {
                console.error("Error fetching store or services:", error);
                message.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        if (storeId) fetchData();
    }, [storeId]);

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={[16, 16]}>
                {/* Left Section: Store Details */}
                <Col xs={24} md={16}>
                    {store ? (
                        <Card>
                            <Typography.Title level={2}>{store.name}</Typography.Title>
                        </Card>
                    ) : (
                        <Typography.Text type="warning">Store not found.</Typography.Text>
                    )}

                    <Card>
                        <Typography.Paragraph>{store?.description}</Typography.Paragraph>
                    </Card>

                    <Divider />


                    <Divider />

                    <Typography.Title level={3}>Store Images</Typography.Title>
                    {storeImages.length > 0 ? (
                        <Row gutter={16}>
                            {storeImages.map((image) => (
                                <Col span={8} key={image.ID}>
                                    <Card hoverable>
                                        <Image src={image.image_url} alt="Store Image" />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Typography.Text>No images available for this store.</Typography.Text>
                    )}

                    <Typography.Title level={3}>Services</Typography.Title>
                    {services.length > 0 ? (
                        <List
                            grid={{ gutter: 16, column: 2 }}
                            dataSource={services}
                            renderItem={(service) => (
                                <List.Item>
                                    <Card title={service.name_service}>
                                        <Typography.Paragraph>
                                            <b>Category:</b> {service.category_pet || "N/A"}
                                        </Typography.Paragraph>
                                        <Typography.Paragraph>
                                            <b>Duration:</b> {service.duration} minutes
                                        </Typography.Paragraph>
                                        <Typography.Paragraph>
                                            <b>Price:</b> {service.price} THB
                                        </Typography.Paragraph>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Typography.Text>No services available for this store.</Typography.Text>
                    )}

                    <Divider />
                </Col>

                {/* Right Section: User Info and Contact */}
                <Col xs={24} md={8}>
                    <div style={{
                        width: '30%',
                        padding: '20px',
                        position: 'fixed',
                        top: '160px', // Adjust the top positioning as needed
                        right: '40px' // Ensures it’s aligned to the right
                    }}>
                        <Card>
                            <Space direction="vertical" align="center">
                                <Avatar
                                    src={store?.user?.Profile || undefined}
                                    size={150}
                                    icon={<UserOutlined />}
                                />
                                <Typography.Text strong>
                                    {store?.user?.first_name && store?.user?.last_name
                                        ? `${store?.user?.first_name} ${store?.user?.last_name}`
                                        : "No user name available"}
                                </Typography.Text>
                            </Space>
                        </Card>

                        <Card style={{ marginTop: "20px" }}>
                            <Title level={4}>
                                <PhoneOutlined /> Contact
                            </Title>
                            <Paragraph>
                                <strong>Location:</strong> {store?.location || "No location provided"}
                            </Paragraph>
                            <Paragraph>
                                <strong>Time Open:</strong> {store?.time_open || "No time provided"}
                            </Paragraph>
                            <Paragraph>
                                <strong>Status:</strong> {store?.status || "No status provided"}
                            </Paragraph>
                        </Card>
                        {/* Button for Booking */}
                        <Link to={`/stores/${storeId}/booking`}>
                            <Button type="primary" size="large" block>
                                Book Now
                            </Button>
                        </Link>

                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default StorePage;