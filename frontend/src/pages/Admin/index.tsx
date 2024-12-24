import React, { useEffect, useState } from "react";
import {
    Card,
    Typography,
    Table,
    Button,
    Divider,
    message,
    Row,
    Col,
    Select,
} from "antd";
import { GetAllApplications, UpdatePetStoreApplicationStatus } from "../../services/https";
import { PetStoreApplicationInterface } from "../../interfaces/Petstoreapp";

const { Title } = Typography;
const { Option } = Select;

const Admin: React.FC = () => {
    const [applications, setApplications] = useState<PetStoreApplicationInterface[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<PetStoreApplicationInterface[]>([]);
    const [status, setStatus] = useState<string>("");

    // Fetch all pet store applications
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await GetAllApplications();
                setApplications(response.data.applications || []);
                setFilteredApplications(response.data.applications || []); // Set initial data to display
            } catch (error) {
                message.error("ไม่สามารถดึงข้อมูลคำขอสมัครได้");
            }
        };
        fetchApplications();
    }, []);

    // Handle status change and filter data
    const handleStatusChange = (value: string) => {
        setStatus(value);
        if (value) {
            // Filter applications by selected status
            const filteredData = applications.filter(
                (app) => app.status === value
            );
            setFilteredApplications(filteredData);
        } else {
            // If "All" is selected, show all applications
            setFilteredApplications(applications);
        }
    };

    // Handle update status
    const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
        if (!newStatus) {
            message.error("กรุณากรอกสถานะ");
            return;
        }

        try {
            const response = await UpdatePetStoreApplicationStatus(applicationId, { status: newStatus });
            if (response.status === 200) {
                message.success("อัปเดตสถานะสำเร็จ");
                // Re-fetch applications to reflect changes
                const updatedApplications = await GetAllApplications();
                setApplications(updatedApplications.data.applications || []);
                // Reapply the filter to keep the view consistent
                handleStatusChange(status);
            } else {
                message.error("ไม่สามารถอัปเดตสถานะได้");
            }
        } catch (error) {
            message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
    };

    // Columns for the table
    const columns = [
        {
            title: "ชื่อร้าน",
            dataIndex: "store_name",
            key: "store_name",
        },
        {
            title: "ชื่อผู้สมัคร",
            dataIndex: "User.first_name",
            key: "first_name",
            render: (_text: string, record: any) => (
                <span>{record.User?.first_name} {record.User?.last_name}</span>
            ),
        },
        {
            title: "อีเมล",
            dataIndex: "User.email",
            key: "email",
            render: (_text: string, record: any) => (
                <span>{record.User?.email}</span>
            ),
        },
        {
            title: "phone",
            dataIndex: "phone",
            key: "phone",
        },  
        {
            title: "สถานะ",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "การดำเนินการ",
            key: "action",
            render: (_text: string, record: any) => (
                <div>
                    <Button
                        type="primary"
                        onClick={() => handleUpdateStatus(record.ID, "approved")}
                        style={{ marginRight: 8 }}
                    >
                        ยอมรับ
                    </Button>
                    <Button
                        style={{ backgroundColor: 'red', color: 'white' }}
                        onClick={() => handleUpdateStatus(record.ID, "rejected")}
                    >
                        ปฏิเสธ
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Card style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
            <Title level={3}>การจัดการคำขอสมัครร้าน</Title>
            <Divider />
            
            <Row justify="end" gutter={16}>
                <Col>
                    <Select
                        style={{ width: "200px" }}
                        placeholder="เลือกสถานะ"
                        value={status}
                        onChange={handleStatusChange}
                    >
                        <Option value="">ทั้งหมด</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="approved">Approved</Option>
                        <Option value="rejected">Rejected</Option>
                    </Select>
                </Col>
            </Row>

            <Divider />

            <Table
                dataSource={filteredApplications}
                columns={columns}
                rowKey="ID"
                pagination={false}
            />
        </Card>
    );
};

export default Admin;
