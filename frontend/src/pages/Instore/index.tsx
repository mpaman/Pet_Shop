import React, { useState, useEffect } from "react";
import { Card, Typography, Divider, List, message, Row, Col, Image } from "antd";
import { useParams } from "react-router-dom";
import { GetStoreByID, GetAllService, GetAllStoreImage } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { StoreImageInterface } from "../../interfaces/StoreImage"; // Import interface ของ StoreImage

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

    
                // เข้าถึงฟิลด์ data.data และตรวจสอบว่าเป็น array หรือไม่
                const allServices = Array.isArray(serviceResponse.data?.data) ? serviceResponse.data.data : [];

    
                // กรองเฉพาะบริการที่ตรงกับ store_id
                const filteredServices = allServices.filter(
                    (service) => service.store_id === Number(storeId)
                );
    
                setServices(filteredServices);

                // ดึงข้อมูล StoreImage สำหรับ storeId นี้
                const imageResponse = await GetAllStoreImage();
                console.log("Store Image Response:", imageResponse);
                
                // ตรวจสอบว่า imageResponse.data เป็น array หรือไม่
                if (Array.isArray(imageResponse.data)) {
                    // กรองข้อมูล StoreImage ที่ตรงกับ storeId
                    const filteredStoreImages = imageResponse.data.filter(
                        (image: StoreImageInterface) => image.store_id === Number(storeId)
                    );
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
            {loading ? (
                <Typography.Text>Loading...</Typography.Text>
            ) : (
                <>
                    {store ? (
                        <Card>
                            <Typography.Title level={2}>{store.name}</Typography.Title>
                            <Typography.Paragraph>{store.description}</Typography.Paragraph>
                            <Typography.Paragraph>
                                <b>Location:</b> {store.location}
                            </Typography.Paragraph>
                            <Typography.Paragraph>
                                <b>Contact:</b> {store.contact_info}
                            </Typography.Paragraph>
                            <Typography.Paragraph>
                                <b>Opening Time:</b> {store.time_open}
                            </Typography.Paragraph>
                            <Typography.Paragraph>
                                <b>Status:</b> {store.status}
                            </Typography.Paragraph>
                        </Card>
                    ) : (
                        <Typography.Text type="warning">Store not found.</Typography.Text>
                    )}

                    <Divider />

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
                </>
            )}
        </div>
    );
};

export default StorePage;
