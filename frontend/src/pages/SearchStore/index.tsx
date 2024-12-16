import { useState, useEffect } from "react";
import {
    Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Card, Space, Tooltip
} from "antd";
import { GetAllStores } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { useNavigate } from "react-router-dom";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Geocoding API URL
const GEOCODING_API_URL = "https://nominatim.openstreetmap.org/search?format=json&q=";

const { Option } = Select;

function StoreList() {
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [filteredStores, setFilteredStores] = useState<StoreInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState<string>(""); // คำค้นหาจาก input
    const [selectedService, setSelectedService] = useState<string | null>(null); // บริการที่เลือก
    const navigate = useNavigate();

    const [storeLocations, setStoreLocations] = useState<any[]>([]); // เก็บพิกัดร้านค้า
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 5;

    // ดึงพิกัดจาก sub_district และ province
    const getCoordinates = async (sub_district: string, province: string) => {
        const query = `${sub_district}, ${province}`;
        const response = await fetch(`${GEOCODING_API_URL}${query}`);
        const data = await response.json();
        if (data && data[0]) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            };
        }
        return null; // หากไม่พบพิกัด
    };

    // ฟังก์ชันดึงข้อมูลร้านค้า
    const getStores = async () => {
        try {
            let res = await GetAllStores();
            if (res.status === 200 && Array.isArray(res.data.data)) {
                setStores(res.data.data);
                setFilteredStores(res.data.data);

                const allServices = res.data.data.flatMap((store: { services: any }) => store.services || []);
                const uniqueServices = Array.from(
                    new Map(allServices.map((service: ServiceInterface) => [service.name_service, service])).values()
                );
                setServices(uniqueServices);

                // ดึงพิกัดจาก sub_district และ province
                const locations = await Promise.all(res.data.data.map(async (store) => {
                    const coordinates = await getCoordinates(store.sub_district, store.province);
                    return { id: store.ID, coordinates };
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

    // ฟังก์ชันคลิกไปยังร้านค้า
    const handleStoreClick = (storeId: number) => {
        navigate(`/stores/${storeId}`);
    };

    // ฟังก์ชันค้นหาสำหรับ input
    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    // ฟังก์ชันการเปลี่ยนบริการที่เลือก
    const handleSelectChange = (value: string | null) => {
        setSelectedService(value);
    };

    // ฟังก์ชันการเปลี่ยนหน้า
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // useEffect สำหรับดึงข้อมูลร้านค้า
    useEffect(() => {
        getStores();
    }, []);

    // useEffect สำหรับฟิลเตอร์ข้อมูลร้านค้า
    useEffect(() => {
        const filtered = stores.filter((store) => {
            const matchesSearchTerm =
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.province.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService =
                !selectedService || store.services?.some((service: { name_service: string }) => service.name_service === selectedService);

            return matchesSearchTerm && matchesService;
        });
        setFilteredStores(filtered);
        setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 หลังจากกรองข้อมูล
    }, [searchTerm, selectedService, stores]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentStores = filteredStores.slice(startIndex, endIndex);

    return (
        <>
            {contextHolder}
            <Row justify="center" gutter={[16, 16]} style={{ marginTop: 20 }}>
                {/* ซ้าย: ช่องค้นหาและเลือกบริการ */}
                <Col xs={24} md={10}>
                    <Typography.Title level={2}>ค้นหาร้านค้า</Typography.Title>

                    {/* Card สำหรับค้นหาบริการและสถานที่ */}
                    <Card >
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
                                        placeholder="ค้นหาร้านหรือสถานที่"
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

                    {/* แสดงร้านค้า */}
                    <div style={{ marginTop: 20 }}>
                        {currentStores.map((store) => {
                            // หา service ที่ตรงกับ selectedService ในร้านปัจจุบัน
                            const matchedService = store.services?.find(
                                (service: { name_service: string | null; }) => service.name_service === selectedService
                            );

                            return (
                                <Card
                                    key={store.ID}
                                    hoverable
                                    style={{ marginBottom: 20 }}
                                    onClick={() => handleStoreClick(store.ID)}
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
                                                <EnvironmentOutlined /> {store.sub_district}, {store.district}, {store.province}
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

                    {/* Pagination */}
                    <Row justify="center" style={{ marginTop: 20 }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredStores.length}
                            onChange={handlePageChange}
                        />
                    </Row>
                </Col>

                {/* ขวา: แผนที่ */}
                <Col xs={24} md={10}>
                    <MapContainer
                        center={[13.736717, 100.523186]} // เริ่มต้นที่กรุงเทพ
                        zoom={6}
                        style={{ height: "80vh", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {storeLocations
                            .filter((storeLocation) =>
                                filteredStores.some((store) => store.ID === storeLocation.id) // กรองเฉพาะร้านที่อยู่ใน filteredStores
                            )
                            .map((storeLocation) => {
                                const store = stores.find((s) => s.ID === storeLocation.id);
                                return storeLocation.coordinates ? (
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
                                            {store.sub_district}, {store.district}, {store.province}
                                        </Popup>
                                    </Marker>
                                ) : null;
                            })}
                    </MapContainer>
                </Col>

            </Row >
        </>
    );
}

export default StoreList;
