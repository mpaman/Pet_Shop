import React, { useState, useEffect } from "react";
import { Card, Avatar, Space, message, Typography, Divider, List, Row, Col } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { GetStoreByID } from "../../services/https/index";

const { Title, Paragraph } = Typography;

const StorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
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
                const storeResponse = await GetStoreByID(storeId);
                if (storeResponse.status === 200) {
                    setStore(storeResponse.data);
                } else {
                    messageApi.open({ type: "error", content: "Failed to load store details" });
                }

                // const serviceResponse = await GetServiceByStoreID(storeId);
                // if (serviceResponse.status === 200) {
                //     setServices(serviceResponse.data);
                // } else {
                //     messageApi.open({ type: "error", content: "Failed to load services" });
                // }
            } catch (error) {
                messageApi.open({ type: "error", content: "Error fetching store or services" });
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId, messageApi]);

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
                            <List
                                dataSource={services}
                                renderItem={(service) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={service.name_service}
                                            description={`Price: ${service.price} | Duration: ${service.duration} mins`}
                                        />
                                    </List.Item>
                                )}
                            />
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
                                    {store?.User?.first_name} {store?.User?.last_name}
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
