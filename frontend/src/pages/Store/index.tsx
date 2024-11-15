// components/Store.tsx
import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import { StoreInterface } from "../../interfaces/Store";
import { DeleteStoreById, GetAllStores } from "../../services/https";

function Store() {
    const navigate = useNavigate();
    const [store, setStore] = useState<StoreInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    const columns: ColumnsType<StoreInterface> = [
        {
            title: "",
            render: (record) => (
                <Button
                    type="dashed"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteStoreById(record.ID)}
                />
            ),
        },
        {
            title: "ชื่อร้าน",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "ที่อยู่ร้าน",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "ชื่อผู้ใช้",
            render: (record) => <>{record.user?.first_name || "ไม่พบข้อมูล"}</>,
        },
        {
            title: "นามสกุลผู้ใช้",
            render: (record) => <>{record.user?.last_name || "ไม่พบข้อมูล"}</>,
        },
        {
            title: "",
            render: (record) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/store/edit/${record.ID}`)}
                >
                    แก้ไขข้อมูล
                </Button>
            ),
        },
    ];

    const deleteStoreById = async (id: string) => {
        try {
            let res = await DeleteStoreById(id);
            if (res.status === 200) {
                messageApi.open({ type: "success", content: "ลบข้อมูลสำเร็จ" });
                await getStores();
            } else {
                messageApi.open({ type: "error", content: "เกิดข้อผิดพลาด" });
            }
        } catch (error) {
            messageApi.open({ type: "error", content: "Error occurred" });
        }
    };

    const getStores = async () => {
        try {
            let res = await GetAllStores();
            console.log("Data fetched from API:", res.data); // Debugging line
            setStore(res.data.data || []); // ใช้ res.data.data ตามข้อมูลที่คุณส่งมา
        } catch (error) {
            console.error("Error fetching stores:", error);
            messageApi.open({ type: "error", content: "Error fetching stores" });
        }
    };
    

    useEffect(() => {
        getStores();
    }, []);

    return (
        <>
            {contextHolder}
            <Divider />
            <Row>
                <Col span={12}>
                    <h2>สร้าง Store</h2>
                </Col>
                <Col span={12} style={{ textAlign: "end" }}>
                    <Space>
                        <Link to="/store/create">
                            <Button type="primary" icon={<PlusOutlined />}>
                                สร้างร้าน
                            </Button>
                        </Link>
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Table
                columns={columns}
                dataSource={store}
                rowKey="ID"
            />
        </>
    );
}

export default Store;
