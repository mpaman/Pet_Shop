import React, { useState, useEffect } from "react";
import {
    Typography,
    Row,
    Col,
    Button,
    Space,
    Avatar,
    Card,
    message,
    Spin, // Import the Spin component for loading state
} from "antd";
import {
    PhoneOutlined,
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
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

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
                if (!storeId) {
                    message.error("Store ID is missing.");
                    return;
                }

                setLoading(true);

                const storeResponse = await GetStoreByID(storeId);
                setStore(storeResponse.data);

                const serviceResponse = await GetAllService();
                const filteredServices = serviceResponse.data?.data.filter(
                    (service: { store_id: number }) =>
                        service.store_id === Number(storeId)
                );
                setServices(filteredServices || []);

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

        fetchData();
    }, [storeId]);

    const statusColor = (status: string) => {
        switch (status) {
            case "open":
                return "#2A9D8F";
            case "close":
                return "#F4A261";
            case "full":
                return "#E63946";
            default:
                return "#8D99AE";
        }
    };

    return (
        <div
            style={{
                padding: "40px 20px",
                backgroundColor: "#f7f9fc",
                minHeight: "100vh",
            }}
        >
            {loading ? ( // Show loading spinner while data is being fetched
                <div style={{ textAlign: "center", marginTop: "100px" }}>
                    <Spin size="large" />
                </div>
            ) : (
                store && (
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <Title level={2} style={{ color: "#1D3557" }}>
                            {store.name || "No Store Name"}
                        </Title>
                    </div>
                )
            )}

            <Row
                gutter={[24, 24]}
                justify="center"
                style={{ maxWidth: "1200px", margin: "0 auto" }}
            >
                <Col xs={24} md={16}>
                    <div style={{ marginBottom: "30px" }}>
                        <Title level={3} style={{ color: "#457B9D" }}>
                            Gallery
                        </Title>
                        {storeImages.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {storeImages.map((image) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        lg={8}
                                        key={image.ID}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "500px",
                                                overflow: "hidden",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            <img
                                                src={image.image_url}
                                                alt="Gallery"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Paragraph>
                                No images available for this store.
                            </Paragraph>
                        )}
                    </div>

                    <div>
                        <Title level={3} style={{ color: "#457B9D" }}>
                            About
                        </Title>
                        <Paragraph
                            className="preformatted-text"
                            style={{
                                textAlign: "justify",
                                lineHeight: 1.8,
                                padding: "0 15px",
                            }}
                        >
                            {store?.description ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: store?.description,
                                    }}
                                />
                            ) : (
                                "ไม่มีคำอธิบาย"
                            )}
                        </Paragraph>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
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
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                padding: "16px",
                                            }}
                                        >
                                            <Title level={4} style={{ color: "#1D3557" }}>
                                                {service.name_service || "N/A"}
                                            </Title>
                                            <Paragraph>
                                                <b>Category:</b>{" "}
                                                {service.categorypet?.PtName || "N/A"}
                                            </Paragraph>
                                            <Paragraph>
                                                <b>Duration:</b>{" "}
                                                {service.duration} minutes
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
                            <Paragraph>
                                No services available for this store.
                            </Paragraph>
                        )}
                    </div>

                    {store && (
                        <div style={{ height: "400px", borderRadius: "8px" }}>
                            <MapContainer
                                center={[store.latitude, store.longitude]}
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker
                                    position={[store.latitude, store.longitude]}
                                >
                                    <Popup>{store.name}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}
                </Col>

                <Col xs={24} md={8}>
                    {store && (
                        <div style={{ position: "sticky", top: "10px" }}>
                            <Card
                                style={{ textAlign: "center", padding: "20px" }}
                            >
                                <Space direction="vertical" align="center">
                                    <Avatar
                                        size={120}
                                        src={store.profile_image || undefined}
                                        shape="square"
                                        style={{ borderRadius: "8px" }}
                                    />
                                </Space>
                            </Card>

                            <Card style={{ marginTop: "20px" }}>
                                <Title level={4}>
                                    <PhoneOutlined /> Contact
                                </Title>
                                <Paragraph>
                                    <strong>Province:</strong>{" "}
                                    {store.province?.SaName || "N/A"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>District:</strong>{" "}
                                    {store.district || "N/A"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Opening:</strong>{" "}
                                    {store.time_open || "N/A"}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Closing:</strong>{" "}
                                    {store.time_close || "N/A"}
                                </Paragraph>
                                <Paragraph>
                                    <b>Status:</b>
                                    <span
                                        style={{
                                            color: "white",
                                            backgroundColor: statusColor(
                                                store.status
                                            ),
                                            padding: "2px 8px",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        {store.status || "N/A"}
                                    </span>
                                </Paragraph>
                                <Link to={`/stores/${storeId}/booking`}>
                                    <Button
                                        block
                                        disabled={store?.status !== "open"}
                                        style={{
                                            marginTop: "10px",
                                            background: store?.status === "open" ? "#E63946" : "#8D99AE",
                                            color: "white",
                                            borderRadius: "20px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {store?.status === "open" ? "Book Now" : "ไม่สามารถจองได้"}
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
