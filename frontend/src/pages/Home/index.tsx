import { useState, useEffect } from "react";
import { Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Card } from "antd";
import { GetAllStores } from "../../services/https/index"; // สมมุติว่ามีบริการนี้ในการเรียก API
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service"; // ต้อง import interface ของ Service ด้วย
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

function StoreList() {
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [filteredStores, setFilteredStores] = useState<StoreInterface[]>([]);
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState<string>(""); // คำค้นหา
    const [selectedService, setSelectedService] = useState<string | null>(null); // บริการที่เลือก
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 5; // จำนวนรายการต่อหน้า

    const getStores = async () => {
        try {
            let res = await GetAllStores();
            if (res.status === 200 && Array.isArray(res.data.data)) {
                setStores(res.data.data);
                setFilteredStores(res.data.data);

                // ดึงข้อมูลบริการเฉพาะจาก API
                const uniqueServices = Array.from(
                    new Set(res.data.data.flatMap((store: { services: any; }) => store.services || []))
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
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService =
                !selectedService || store.services?.some((service: { name_service: string; }) => service.name_service === selectedService);

            return matchesSearchTerm && matchesService;
        });
        setFilteredStores(filtered);
        setCurrentPage(1); // Reset to page 1 after filtering
    }, [searchTerm, selectedService, stores]);

    // Pagination logic
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentStores = filteredStores.slice(startIndex, endIndex);

    return (
        <>
            {contextHolder}
            <Row justify="center" style={{ marginTop: 20 }}>
                <Col span={15}>
                    <h2>รายการร้านค้า</h2>
                    <Card>
                        <Row align="middle">
                            <Col>
                                <h5>บริการ</h5>
                                <Select
                                    placeholder="เลือกบริการ"
                                    style={{ width: 300, marginTop: 10 }}
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
                            </Col>
                            <Col>
                                <h5>ค้นหาสถานที่</h5>
                                <Input
                                    placeholder="กรอกตำแหน่งที่ตั้ง"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    value={searchTerm}
                                    style={{ width: 300, marginTop: 10 }}
                                />
                            </Col>
                        </Row>
                    </Card>
                    <Divider />
                    <div style={{ marginTop: 20 }}>
                        {currentStores.map((store) => (
                            <Row key={store.ID} style={{ marginBottom: 20 }}>
                                <Col span={24} onClick={() => handleStoreClick(store.ID)} style={{ cursor: 'pointer' }}>
                                    <Row align="middle">
                                        <Col>
                                            {/* ตรวจสอบว่ามีรูปโปรไฟล์หรือไม่ ถ้าไม่มีใช้ placeholder */}
                                            <Avatar
                                                src={store.user?.Profile || "https://via.placeholder.com/100"}
                                                size={100}
                                                style={{ marginRight: 10 }}
                                            />
                                        </Col>
                                        <Col>
                                            <Typography.Text strong>{store.name}</Typography.Text>
                                        </Col>
                                    </Row>
                                    <Row align="middle">
                                        <Typography.Text>จังหวัด {store.location}</Typography.Text>
                                    </Row>
                                    <Card style={{ width: "100%", marginTop: 5, paddingTop: 5 }}>
                                        {store.description || ""}
                                    </Card>
                                </Col>
                            </Row>
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
