import React, { useState, useEffect } from "react";
import { Card, Avatar, Space, message, Typography, Divider, List, Row, Col, Button } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { GetStoreByID, GetServiceByStoreID } from "../../services/https/index"; // ฟังก์ชันสำหรับดึงข้อมูล
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";

const StorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const [store, setStore] = useState<StoreInterface | null>(null);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // Fetch store details
                const storeResponse = await GetStoreByID(storeId);
                console.log("Store data:", storeResponse.data);
                setStore(storeResponse.data);

                // Fetch services for the store
                const serviceResponse = await GetServiceByStoreID(storeId);
                console.log("Service Response:", serviceResponse);

                // Check if the response has a valid data field and that it's an array
                if (serviceResponse?.data && Array.isArray(serviceResponse.data.services)) {
                    setServices(serviceResponse.data.services); // Assuming services is an array
                } else {
                    message.error("Failed to load services");
                }
            } catch (error) {
                console.error("Error fetching store or services:", error);
                message.error("Error fetching store or services");
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId]);

    return (
        <div className="store-service-page">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {store && (
                        <div className="store-details">
                            <h2>{store.name}</h2>
                            <p>{store.location}</p>
                            <p>{store.contact_info}</p>
                            <p>{store.description}</p>
                            <p>Opening Time: {store.time_open}</p>
                            <p>Status: {store.status}</p>
                        </div>
                    )}

                    {services.length > 0 ? (
                        <div className="services-list">
                            {services.map((service) => (
                                <div key={service.ID} className="service-item">
                                    <h3>{service.name_service}</h3>
                                    <p>Category: {service.category_pet}</p>
                                    <p>Duration: {service.duration} minutes</p>
                                    <p>Price: {service.price} THB</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No services available</p>
                    )}
                </>
            )}
        </div>
    );
};



export default StorePage;
