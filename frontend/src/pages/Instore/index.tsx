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
import {
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import {
    GetStoreByID,
    GetAllService,
    GetAllStoreImage,
} from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { StoreImageInterface } from "../../interfaces/Storeimage";
import "../../App.css";

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

                // Fetch store details
                const storeResponse = await GetStoreByID(storeId);
                setStore(storeResponse.data);

                // Fetch services related to the store
                const serviceResponse = await GetAllService();
                const filteredServices = serviceResponse.data?.data.filter(
                    (service: { store_id: number }) =>
                        service.store_id === Number(storeId)
                );
                setServices(filteredServices || []);

                // Fetch images related to the store
                const imageResponse = await GetAllStoreImage();
                const filteredStoreImages = imageResponse.data?.data.filter(
                    (image: { store_id: number }) =>
                        image.store_id === Number(storeId)
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
        <div
            style={{
                padding: "40px 20px",
                backgroundColor: "#f7f9fc",
                minHeight: "100vh",
            }}
        >
            {/* Store Name */}
            {store && (
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <Title level={2} style={{ color: "#1D3557" }}>
                        {store.name || "No Store Name"}
                    </Title>
                </div>
            )}

            <Row
                gutter={[24, 24]}
                justify="center"
                style={{ maxWidth: "1200px", margin: "0 auto" }}
            >
                {/* Left Section */}
                <Col xs={24} md={16}>
                    {/* Description */}
                    <div>
                        {store && (
                            <div style={{ marginBottom: "30px" }}>
                                <Title level={3} style={{ color: "#457B9D" }}>
                                    About
                                </Title>
                                {/* Option 1: Using CSS */}
                                <Paragraph
                                    className="preformatted-text"
                                    style={{
                                        textAlign: "justify",
                                        lineHeight: 1.8,
                                        padding: "0 15px",
                                    }}
                                >
                                    {store.description ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: store.description,
                                            }}
                                        />
                                    ) : (
                                        "ไม่มีคำอธิบาย"
                                    )}
                                </Paragraph>
                            </div>
                        )}
                    </div>

                    {/* Store Images */}
                    <div style={{ marginBottom: "30px" }}>
                        <Title level={3} style={{ color: "#457B9D" }}>
                            Gallery
                        </Title>
                        {storeImages.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {storeImages.map((image) => (
                                    <Col xs={24} sm={12} lg={8} key={image.ID}>
                                        <Image
                                            src={image.image_url}
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Paragraph>
                                No images available for this store.
                            </Paragraph>
                        )}
                    </div>

                    {/* Services */}
                    <div>
                        <Title level={3} style={{ color: "#457B9D" }}>
                            Services
                        </Title>
                        {services.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {services.map((service) => (
                                    <Col xs={24} sm={12} lg={12} key={service.ID}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                padding: "16px",
                                            }}
                                        >
                                            <Title level={4} style={{ color: "#1D3557" }}>
                                                {service.name_service}
                                            </Title>
                                            <Paragraph>
                                                <b>Category:</b>{" "}
                                                {service.category_pet || "N/A"}
                                            </Paragraph>
                                            <Paragraph>
                                                <b>Duration:</b>{" "}
                                                {service.duration} minutes
                                            </Paragraph>
                                            <div
                                                style={{
                                                    textAlign: "right",
                                                    marginTop: "10px",
                                                }}
                                            >
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
                            <Paragraph>
                                No services available for this store.
                            </Paragraph>
                        )}
                    </div>
                </Col>

                {/* Right Section */}
                <Col xs={24} md={8}>
                    {store && (
                        <div style={{ position: "sticky", top: "10px" }}>
                            {/* User Info */}
                            <Card
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                <Space direction="vertical" align="center">
                                    <Avatar
                                        size={120}
                                        src={store.user?.Profile || undefined}
                                        icon={<UserOutlined />}
                                        shape="square"
                                        style={{
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Title level={4}>
                                        {store.user?.first_name}{" "}
                                        {store.user?.last_name || ""}
                                    </Title>
                                </Space>
                            </Card>

                            {/* Contact Info */}
                            <Card>
                                <Title level={4}>
                                    <PhoneOutlined /> Contact
                                </Title>
                                <Paragraph>
                                    <strong>Location:</strong>{" "}
                                    {store.location || "No location provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Address:</strong>{" "}
                                    {store.address || "No location provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Opening:</strong>{" "}
                                    {store.time_open || "No time provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Closing:</strong>{" "}
                                    {store.time_close || "No time provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Status:</strong>{" "}
                                    {store.status || "No status provided"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Contact:</strong>{" "}
                                    {store.contact_info || "No contact info"}
                                </Paragraph>
                                <Link to={`/stores/${storeId}/booking`}>
                                    <Button
                                        block
                                        style={{
                                            marginTop: "10px",
                                            background: "#E63946",
                                            color: "white",
                                        }}
                                    >
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
