import React, { useState, useEffect } from "react";
import { Card, Avatar, Space, message, Typography, Divider, List, Row, Col } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { GetStoreByID, GetServiceByStoreID } from "../../services/https/index"; // ฟังก์ชันสำหรับดึงข้อมูล

const { Title, Paragraph } = Typography;

const StorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]); // ใช้ array เสมอ
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (!storeId) {
            messageApi.open({ type: "error", content: "Invalid store ID" });
            setLoading(false);
            return;
        }
    
        const fetchStoreData = async () => {
            try {
                // ดึงข้อมูล store
                const storeResponse = await GetStoreByID(storeId);
                if (storeResponse.status === 200) {
                    setStore(storeResponse.data);
                } else {
                    messageApi.open({ type: "error", content: "Failed to load store details" });
                }
    
                // ดึงข้อมูล services
                const serviceResponse = await GetServiceByStoreID(storeId);
                console.log("Service data:", serviceResponse.data); // ตรวจสอบข้อมูลที่ได้
    
                // ตรวจสอบข้อมูลที่ได้รับ
                if (serviceResponse?.data && Array.isArray(serviceResponse.data) && serviceResponse.data.length > 0) {
                    setServices(serviceResponse.data); // ถ้าเป็น array ที่มีข้อมูล ก็จะตั้งค่าให้
                } else {
                    // หากไม่พบข้อมูลหรือข้อมูลไม่ถูกต้อง
                    messageApi.open({ type: "warning", content: "No services available" });
                    setServices([]); // กำหนดให้เป็น array ว่างหากไม่มีบริการ
                }
            } catch (error) {
                messageApi.open({ type: "error", content: "Error fetching store or services" });
            } finally {
                setLoading(false);
            }
        };
    
        fetchStoreData();
    }, [storeId, messageApi]);
    

    useEffect(() => {
        // คอยติดตามการเปลี่ยนแปลงของ services และแสดงข้อความเตือนเมื่อไม่มีบริการ
        if (services.length === 0) {
            messageApi.open({ type: "warning", content: "No services available" });
        }
    }, [services, messageApi]); // คอยติดตามการเปลี่ยนแปลงของ services

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {contextHolder}
            <div style={{ padding: "20px" }}>
                <Row gutter={[16, 16]}>
                    {/* Left Section: Store Details */}
                    <Col xs={24} md={16}>
                        <Card>
                            <Title level={3}>{store?.name || "Untitled"}</Title>
                            <Paragraph>{store?.description || "No description available"}</Paragraph>
                            <Divider />
                            <Title level={4}>Services</Title>

                            {services.length === 0 ? (
                                <Paragraph>No services available for this store</Paragraph> // ถ้าไม่มีบริการจะแสดงข้อความนี้
                            ) : (
                                <List
                                    dataSource={services} // ใช้ services ที่เป็น array
                                    renderItem={(service) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={service.name_service} // ใช้ชื่อบริการ
                                                description={`Price: ${service.price} | Duration: ${service.duration} mins | Category: ${service.category_pet}`} // แสดงข้อมูลราคาบริการ, ระยะเวลา, และประเภทสัตว์
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </Col>

                    {/* Right Section: User Info and Contact */}
                    <Col xs={24} md={8}>
                        <Card>
                            <Space direction="vertical" align="center">
                                <Avatar
                                    src={store?.User?.Profile || undefined}
                                    size={80}
                                    icon={<UserOutlined />}
                                />
                                <Typography.Text strong>
                                    {store?.User?.first_name && store?.User?.last_name
                                        ? `${store?.User?.first_name} ${store?.User?.last_name}`
                                        : "No user name available"}
                                </Typography.Text>
                            </Space>
                        </Card>

                        <Card style={{ marginTop: "20px" }}>
                            <Title level={4}>
                                <PhoneOutlined /> Contact
                            </Title>
                            <Paragraph>{store?.contact_info || "No Contact Information"}</Paragraph>
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
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default StorePage;
