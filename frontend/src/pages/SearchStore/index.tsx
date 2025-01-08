import { useState, useEffect } from "react";
import {
    Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Card, Space,
} from "antd";
import { GetAllStores } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { useNavigate } from "react-router-dom";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./searchstore.css";



const { Option } = Select;

function StoreList() {
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [filteredStores, setFilteredStores] = useState<StoreInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState<string>(""); 
    const [selectedService, setSelectedService] = useState<string | null>(null); 
    const navigate = useNavigate();

    const [storeLocations, setStoreLocations] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 5;

    const getStores = async () => {
        try {
            let res = await GetAllStores();
            if (res.status === 200 && Array.isArray(res.data.data)) {
                setStores(res.data.data);
                setFilteredStores(res.data.data);

                const allServices = res.data.data.flatMap((store: { services: any }) => store.services || []);
                const uniqueServices: ServiceInterface[] = Array.from(
                    new Map(
                        (allServices as ServiceInterface[]).map((service: ServiceInterface) => [service.name_service, service])
                    ).values()
                );                
                setServices(uniqueServices);

                // ดึงพิกัดจาก API โดยตรง
                const locations = res.data.data.map((store: StoreInterface) => ({
                    id: store.ID,
                    coordinates: store.latitude && store.longitude
                        ? { lat: store.latitude, lon: store.longitude }
                        : null,
                }));
                setStoreLocations(locations);
            } else {
                setStores([]);
                setFilteredStores([]);
                messageApi.open({
                    type: "error",
                    content: res.data.error,
                });
            }
        } catch (error) {
            messageApi.open({
                type: "error",
                content: "Failed to fetch stores",
            });
        }
    };

    const handleStoreClick = (storeId: number) => {
        navigate(`/stores/${storeId}`);
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleSelectChange = (value: string | null) => {
        setSelectedService(value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        getStores();
    }, []);

    useEffect(() => {
        const filtered = stores.filter((store) => {
            const matchesSearchTerm =
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.province?.SaName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService =
                !selectedService || store.services?.some((service: { name_service: string }) => service.name_service === selectedService);

            return matchesSearchTerm && matchesService;
        });
        setFilteredStores(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedService, stores]);

    

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentStores = filteredStores.slice(startIndex, endIndex);

    return (
        <>
            {contextHolder}
            <Row justify="center" gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={10}>
                    <Typography.Title level={2}>ค้นหาร้านค้า</Typography.Title>
                    <Card>
                        <Row gutter={[16, 16]} align="middle" justify="space-between">
                            <Col span={12}>
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <Typography.Text strong>บริการ</Typography.Text>
                                    <Select
                                        placeholder="เลือกบริการ"
                                        style={{ width: "100%" }}
                                        onChange={handleSelectChange}
                                        allowClear
                                        value={selectedService || undefined}
                                    >
                                        {services.map((service) => (
                                            <Option key={service.ID} value={service.name_service}>
                                                {service.name_service}
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                            </Col>

                            <Col xs={24} md={12}>
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <Typography.Text strong>ค้นหาสถานที่</Typography.Text>
                                    <Input
                                        placeholder="ค้นหาจังหวัดที่ต้องการ"
                                        onChange={(e) => handleSearch(e.target.value)}
                                        value={searchTerm}
                                        prefix={<SearchOutlined />}
                                        style={{ width: "100%" }}
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Divider />
                    <div style={{ marginTop: 20 }}>
                        {currentStores.map((store) => {
                            const matchedService = store.services?.find(
                                (service: { name_service: string | null }) => service.name_service === selectedService
                            );

                            return (
                                <Card
                                    key={store.ID}
                                    hoverable
                                    style={{ marginBottom: 20 }}
                                    onClick={() => store.ID && handleStoreClick(store.ID)}
                                >
                                    <Row gutter={16} align="middle">
                                        <Col>
                                            <Avatar
                                                src={store.profile_image || "https://via.placeholder.com/100"}
                                                size={80}
                                                style={{ marginRight: 10 }}
                                            />
                                        </Col>
                                        <Col flex="auto">
                                            <Typography.Title level={4}>{store.name}</Typography.Title>
                                            <Typography.Text type="secondary">
                                                <EnvironmentOutlined /> {store.district}, {store.province?.SaName}
                                            </Typography.Text>
                                            {selectedService && (
                                                <div style={{ marginTop: 10 }}>
                                                    {matchedService ? (
                                                        <Space direction="vertical">
                                                            <Typography.Text strong>
                                                                ราคา: {matchedService.price} บาท
                                                            </Typography.Text>
                                                            <Typography.Text>
                                                                ระยะเวลา: {matchedService.duration} นาที
                                                            </Typography.Text>
                                                        </Space>
                                                    ) : (
                                                        <Typography.Text type="danger">
                                                            ไม่มีข้อมูลสำหรับบริการนี้
                                                        </Typography.Text>
                                                    )}
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        })}
                    </div>

                    <Row justify="center" style={{ marginTop: 20 }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredStores.length}
                            onChange={handlePageChange}
                        />
                    </Row>
                </Col>

                <Col xs={24} md={10}>
                    <MapContainer
                        center={[13.736717, 100.523186]} // เริ่มต้นที่กรุงเทพ
                        zoom={6}
                        style={{ height: "80vh", width: "100%" }}
                        className="map-container"

                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {storeLocations
                            .filter((storeLocation) =>
                                filteredStores.some((store) => store.ID === storeLocation.id)
                            )
                            .map((storeLocation) => {
                                const store = stores.find((s) => s.ID === storeLocation.id);
                                return store ? (
                                    <Marker
                                        key={store.ID}
                                        position={[storeLocation.coordinates.lat, storeLocation.coordinates.lon]}
                                        icon={new L.Icon({
                                            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                                            iconSize: [25, 41],
                                            iconAnchor: [12, 41],
                                        })}
                                    >
                                        <Popup>
                                            <strong>{store.name}</strong>
                                            <br />
                                            {store.district}, {store.province?.SaName}
                                        </Popup>
                                    </Marker>
                                ) : null;
                            })}
                    </MapContainer>
                </Col>
            </Row>
        </>
    );
}

export default StoreList;
