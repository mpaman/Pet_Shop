import { useState, useEffect } from "react";
import {
    Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Card, Space, Button, Tooltip
} from "antd";
import { GetAllStores } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { useNavigate } from "react-router-dom";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons"; // เพิ่ม นอกจาก ant

const { Search } = Input;
const { Option } = Select;

function StoreList() {
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [filteredStores, setFilteredStores] = useState<StoreInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 5;

    const getStores = async () => {
        try {
            let res = await GetAllStores();
            if (res.status === 200 && Array.isArray(res.data.data)) {
                setStores(res.data.data);
                setFilteredStores(res.data.data);
    
                // ดึงข้อมูลบริการทั้งหมดและกรองข้อมูลซ้ำตาม name_service
                const allServices = res.data.data.flatMap((store: { services: any; }) => store.services || []);
                const uniqueServices = Array.from(
                    new Map(allServices.map((service: ServiceInterface) => [service.name_service, service])).values()
                );
    
                setServices(uniqueServices);
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
                store.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService =
                !selectedService || store.services?.some((service: { name_service: string; }) => service.name_service === selectedService);

            return matchesSearchTerm && matchesService;
        });
        setFilteredStores(filtered);
        setCurrentPage(1); // Reset to page 1 after filtering
    }, [searchTerm, selectedService, stores]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentStores = filteredStores.slice(startIndex, endIndex);

    return (
        <>
            {contextHolder}
            <Row justify="center" style={{ marginTop: 1 }}>
                <Col span={12}>
                    <Typography.Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
                        รายการร้านค้า
                    </Typography.Title>
                    <Card style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}>
                        <Row gutter={[16, 16]} align="middle" justify="space-between">
                            <Col xs={24} md={12}>
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
                                        placeholder="กรอกตำแหน่งที่ตั้ง"
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
                        {currentStores.map((store) => (
                            <Card
                                key={store.ID}
                                hoverable
                                style={{ marginBottom: 20 }}
                                onClick={() => handleStoreClick(store.ID)}
                            >
                                <Row gutter={16} align="middle">
                                    <Col>
                                        <Avatar
                                            src={store.user?.Profile || "https://via.placeholder.com/100"}
                                            size={80}
                                            style={{ marginRight: 10 }}
                                        />
                                    </Col>
                                    <Col flex="auto">
                                        <Typography.Title level={4}>{store.name}</Typography.Title>
                                        <Typography.Text type="secondary">
                                            <EnvironmentOutlined /> {store.location}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
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
            </Row>
        </>
    );
}

export default StoreList;
