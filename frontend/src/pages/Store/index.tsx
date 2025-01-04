import { Card, Row, Col, Avatar, Button, Typography, Space, Divider, Modal, message, Select } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreInterface } from "../../interfaces/Store";
import { DeleteStoreById, GetAllStores, UpdateStoreStatus, GetUserProfile} from "../../services/https";
import "./StorePage.css";
import { BookingInterface } from "../../interfaces/Bookingstore";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;

function Store() {
    const navigate = useNavigate();
    const [store, setStore] = useState<StoreInterface[]>([]);
    const [, setLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | null>(null);

    const getUserProfile = async () => {
        try {
            const res = await GetUserProfile();
            setUserId(res.ID);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const getStores = async () => {
        setLoading(true);
        try {
            const res = await GetAllStores();
            const allStores = res.data.data || [];
            const filteredStores = allStores.filter((store: { user_id: number | null; }) => store.user_id === userId);
            setStore(filteredStores);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteStoreById = async (id: string) => {
        try {
            await DeleteStoreById(id);
            message.success("ลบร้านค้าและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว");
            getStores(); // Refresh ข้อมูลร้านค้า
        } catch (error) {
            console.error("Error deleting store:", error);
            message.error("เกิดข้อผิดพลาดในการลบร้านค้า");
        }
    };

    const confirmDelete = (id: string) => {
        confirm({
            title: "ยืนยันการลบร้านค้า",
            content: "คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
            okText: "ยืนยัน",
            okType: "danger",
            cancelText: "ยกเลิก",
            onOk() {
                deleteStoreById(id);
            },
        });
    };

    const handleStatusChange = async (storeId: string, status: string) => {
        try {
            const payload: BookingInterface = {
                status: status,
                store_id: parseInt(storeId),
                booker_user_id: 0,
                service_id: 0,
                total_cost: 0,
                contact_number: "",
                count_pet: 0,
                date: "",
                booking_time: "",
                BookerUser: undefined,
                pets: []
            };

            await UpdateStoreStatus(storeId, payload);
            message.success("อัพเดตสถานะร้านสำเร็จ");
            getStores();
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("เกิดข้อผิดพลาดในการอัพเดตสถานะร้าน");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getUserProfile();
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (userId !== null) {
            getStores();
        }
    }, [userId]);

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
        <>
            <Row justify="center" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={2} style={{ color: "#1D3557" }}>จัดการร้านค้า</Title>
                </Col>
            </Row>

            <Row justify="center" style={{ marginBottom: 20 }}>
                {store.length === 0 && (
                    <Button
                        style={{
                            background: "#2A9D8F",
                            color: "white",
                            fontWeight: "bold",
                        }}
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/store/create")}
                    >
                        เพิ่มร้านค้า
                    </Button>
                )}
            </Row>

            <Row gutter={[24, 24]} justify="center">
                {store.map((item) => (
                    <Col key={item.ID} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            style={{
                                borderRadius: 16,
                                overflow: "hidden",
                                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                                marginBottom: 16,
                            }}
                            cover={
                                <div style={{ textAlign: "center", padding: "16px" }}>
                                    <Avatar
                                        shape="square"
                                        size={150}
                                        src={item.profile_image || "https://via.placeholder.com/150"}
                                        alt={item.user?.first_name || "No Image"}
                                        style={{
                                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                                        }}
                                    />
                                </div>
                            }
                        >
                            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                <Title level={4} style={{ textAlign: "center", color: "#264653" }}>
                                    {item.name}
                                </Title>
                                <Text>
                                    <strong>จังหวัด: </strong>
                                    {item.province?.saname || "ไม่พบข้อมูล"} {/* ใช้ชื่อจังหวัด */}
                                </Text>
                                <Text>
                                    <strong>สถานะ: </strong>
                                    <span
                                        style={{
                                            color: "white",
                                            backgroundColor: statusColor(item.status),
                                            padding: "4px 8px",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        {item.status || "ไม่มีข้อมูล"}
                                    </span>
                                </Text>
                                <Text>
                                    <strong>เจ้าของ: </strong>
                                    {item.user?.first_name || "ไม่พบข้อมูล"} {item.user?.last_name || ""}
                                </Text>
                            </Space>
                            <Divider />
                            <Space style={{ width: "100%", flexWrap: "wrap", justifyContent: "space-between" }}>
                                <Button
                                    style={{
                                        background: "#E63946",
                                        color: "white",
                                        width: "150px",
                                        borderRadius: "20px",
                                    }}
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/store/edit/${item.ID}`)}
                                >
                                    แก้ไขร้าน
                                </Button>
                                <Button
                                    style={{
                                        background: "#F4A261",
                                        color: "white",
                                        borderRadius: "20px",
                                        width: "150px",
                                    }}
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/store/edit/service/${item.ID}`)}
                                >
                                    แก้ไข Service
                                </Button>
                                <Button
                                    style={{
                                        background: "#2A9D8F",
                                        color: "white",
                                        borderRadius: "20px",
                                        width: "150px",
                                    }}
                                    icon={<EyeOutlined />}
                                    onClick={() => navigate(`/store/booking/${item.ID}`)}
                                >
                                    ตรวจสอบผู้จอง
                                </Button>
                                <Button
                                    style={{
                                        background: "#2A9D8F",
                                        color: "white",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                        width: "150px",
                                    }}
                                    icon={<AppstoreAddOutlined />}
                                    onClick={() => navigate(`/stores/${item.ID}`)}
                                >
                                    Preview Store
                                </Button>
                                <Button
                                    style={{
                                        background: "#8D99AE",
                                        color: "white",
                                        fontWeight: "bold",
                                        borderRadius: "20px",
                                    }}
                                    icon={<DeleteOutlined />}
                                    onClick={() => confirmDelete(item.ID?.toString() || '')}
                                >
                                    ลบร้าน
                                </Button>
                                <Select
                                    value={item.status}
                                    onChange={(value) => handleStatusChange(item.ID?.toString() || '', value)}
                                    style={{ width: 120 }}
                                >
                                    <Option value="open">เปิด</Option>
                                    <Option value="close">ปิด</Option>
                                    <Option value="full">เต็ม</Option>
                                </Select>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
}

export default Store;
