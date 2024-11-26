import React, { useState, useEffect } from "react";
import {
    Typography,
    Divider,
    Row,
    Col,
    Image,
    Button,
    Space,
    Avatar,
    Card,
    message,
} from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { GetStoreByID, GetAllService, GetAllStoreImage } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { StoreImageInterface } from "../../interfaces/Storeimage";

const { Title, Paragraph, Text } = Typography;

const StorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<StoreInterface | null>(null);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const storeResponse = await GetStoreByID(storeId);
                setStore(storeResponse.data);

                const serviceResponse = await GetAllService();
                const filteredServices = serviceResponse.data?.data.filter(
                    (service: { store_id: number }) => service.store_id === Number(storeId)
                );
                setServices(filteredServices || []);

                const imageResponse = await GetAllStoreImage();
                const filteredStoreImages = imageResponse.data?.data.filter(
                    (image: { store_id: number }) => image.store_id === Number(storeId)
                );
                setStoreImages(filteredStoreImages || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        if (storeId) fetchData();
    }, [storeId]);

    return (
        <div style={{ padding: "20px" }}>
            {/* Store Name */}
            {store && (
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <Title level={2} style={{ color: "#1D3557" }}>
                        {store.name}
                    </Title>
                </div>
            )}

            <Row gutter={[24, 24]}>
                {/* Left Section */}
                <Col xs={24} md={16}>
                    {/* Description */}
                    {store && (
                        <div style={{ marginBottom: "30px" }}>
                            <Title level={3} style={{ color: "#457B9D" }}>About</Title>
                            <Paragraph style={{ textAlign: "justify", lineHeight: 1.8 }}>
                                {store.description || "No description provided."}
                            </Paragraph>
                        </div>
                    )}

                    {/* Store Images */}
                    <div style={{ marginBottom: "30px" }}>
                        <Title level={3} style={{ color: "#457B9D" }}>Images</Title>
                        {storeImages.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {storeImages.map((image) => (
                                    <Col xs={24} sm={12} lg={8} key={image.ID}>
                                        <Image
                                            src={image.image_url}
                                            alt="Store"
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Paragraph>No images available for this store.</Paragraph>
                        )}
                    </div>
                    {/* <div style={{ marginBottom: "30px" }}>
                        <Title level={3} style={{ color: "#457B9D" }}>Images</Title>
                        {storeImages.length > 0 ? (
                            <Carousel autoplay style={{ borderRadius: "8px", overflow: "hidden" }}>
                                {storeImages.map((image) => (
                                    <div key={image.ID}>
                                        <img
                                            src={image.image_url}
                                            alt="Store"
                                            style={{
                                                width: "100%",
                                                height: "400px",
                                                objectFit: "contain", // คงอัตราส่วนของภาพ
                                            }}
                                        />
                                    </div>
                                ))}
                            </Carousel>
                        ) : (
                            <Paragraph>No images available for this store.</Paragraph>
                        )}
                    </div> */}

                    {/* Services */}
                    <div>
                        <Title level={3} style={{ color: "#457B9D" }}>Services</Title>
                        {services.length > 0 ? (
                            <Row gutter={[10, 10]}>
                                {services.map((service) => (
                                    <Col xs={24} sm={12} lg={12} key={service.ID}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: "8px",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                padding: "16px",
                                            }}
                                        >
                                            <Title level={4} style={{ color: "#1D3557" }}>
                                                {service.name_service}
                                            </Title>
                                            <Paragraph>
                                                <b>Category:</b> {service.category_pet || "N/A"}
                                            </Paragraph>
                                            <Paragraph>
                                                <b>Duration:</b> {service.duration} minutes
                                            </Paragraph>
                                            <div style={{ textAlign: "right", marginTop: "10px" }}>
                                                <Text
                                                    style={{
                                                        fontSize: "18px",
                                                        fontWeight: "bold",
                                                        color: "#E63946",
                                                    }}
                                                >
                                                    {service.price} THB
                                                </Text>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Paragraph>No services available for this store.</Paragraph>
                        )}
                    </div>
                </Col>

                {/* Right Section */}
                <Col xs={24} md={7}>
                    {store && (
                        <div style={{ position: "sticky", top: "1px" }}>
                            {/* User Info */}
                            <Card style={{ marginBottom: "20px", textAlign: "center" }}>
                                <Space direction="vertical" align="center">
                                    <Avatar
                                        size={120}
                                        src={store.user?.Profile || undefined}
                                        icon={<UserOutlined />}
                                        shape="square"
                                        style={{
                                            borderRadius: "8px",
                                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Title level={4}>
                                        {store.user?.first_name} {store.user?.last_name || ""}
                                    </Title>
                                </Space>
                            </Card>

                            {/* Contact Info */}
                            <Card>
                                <Title level={4}>
                                    <PhoneOutlined /> Contact
                                </Title>
                                <Paragraph>
                                    <strong>Location:</strong> {store.location || "No location provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Time Open:</strong> {store.time_open || "No time provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Status:</strong> {store.status || "No status provided"}
                                </Paragraph>
                                <Link to={`/stores/${storeId}/booking`}>
                                    <Button  block style={{ marginTop: "10px" , background:"#954435",color: "white"} }>
                                        Book Now
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default StorePage;
