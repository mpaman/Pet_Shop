import React, { useState, useEffect } from "react";
import {
    Card,
    Typography,
    Input,
    Space,
    Button,
    Divider,
    message,
    Row,
    Col,
} from "antd";
import { CreatePetStoreApplication, GetUserProfile } from "../../services/https"; // Ensure this is correctly imported
import { PetStoreApplicationInterface } from "../../interfaces/Petstoreapp";
import { UsersInterface } from "../../interfaces/IUser";

const { Title } = Typography;

const AppStore: React.FC = () => {
    const [UserId, setUserId] = useState<string | null>(null);  // ใช้เพื่อเก็บ user_id จาก GetUserProfile
    const [application, setApplication] = useState<Partial<PetStoreApplicationInterface>>({
        store_name: "",
        license_document_url: "",
        phone: "",
        location: "",
        status: "pending",
    });

    const [user, setUser] = useState<Partial<UsersInterface>>({
        first_name: "",
        last_name: "",
        ID: 0,
        Profile: "",
    });

    // ดึงข้อมูลผู้ใช้จาก API และเก็บ user_id
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userResponse = await GetUserProfile(); // เรียก API ที่ใช้ดึงข้อมูลผู้ใช้
                setUser(userResponse);  // เซ็ต user profile
                setUserId(userResponse.ID || null); // เซ็ต userId จาก response
            } catch (error) {
                console.error("Error fetching user profile:", error);
                message.error("ไม่สามารถดึงข้อมูลผู้ใช้");
            }
        };

        fetchUserProfile();
    }, []);  // จะทำงานเมื่อ component โหลดครั้งแรก

    // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล
    const handleInputChange = (key: keyof PetStoreApplicationInterface, value: string) => {
        setApplication({ ...application, [key]: value });
    };

    // ฟังก์ชันการส่งคำขอ
    const handleSubmit = async () => {
        if (!application.store_name || !application.license_document_url || !application.phone || !application.location) {
            message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
    
        if (!UserId) {
            message.error("ไม่พบข้อมูลผู้ใช้");
            return;
        }
    
        // ตรวจสอบค่า email ให้เป็น string ก่อนส่ง
        const appstoreData: PetStoreApplicationInterface = {
            user_id: UserId, // ใช้ string แทน UsersInterface
            store_name: application.store_name!,
            email: user.email || "", // ถ้า user.email เป็น undefined ให้ใช้ค่า "" แทน
            phone: application.phone!,
            location: application.location!,
            license_document_url: application.license_document_url!,
            status: application.status!,
        };
    
        console.log("Store Data:", appstoreData);
    
        try {
            const response = await CreatePetStoreApplication(appstoreData); // เรียก API ที่ใช้สร้างคำขอสมัคร
            if (response.status === 201) {
                message.success("ส่งคำขอสมัครร้านสำเร็จ");
            } else if (response.status === 409) {
                message.error("มีการสมัครแล้ว");
            } else {
                message.error("เกิดข้อผิดพลาดในการส่งคำขอ");
            }
        } catch (error) {
            message.error("ไม่สามารถส่งคำขอได้");
        }
    };
    
    return (
        <Card style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>
            <Title level={3}>สมัครร้าน</Title>
            <Divider />

            {user && (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Typography.Text>
                        <strong>ชื่อผู้สมัคร: </strong>
                        {user.first_name} {user.last_name}
                    </Typography.Text>
                </Space>
            )}

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Input
                    placeholder="ชื่อร้าน"
                    value={application.store_name}
                    onChange={(e) => handleInputChange("store_name", e.target.value)}
                />
                <Input
                    placeholder="Phone"
                    value={application.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <Input
                    placeholder="ที่อยู่"
                    value={application.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                />
                <Input
                    placeholder="URL ของเอกสารใบอนุญาต"
                    value={application.license_document_url}
                    onChange={(e) => handleInputChange("license_document_url", e.target.value)}
                />
            </Space>

            <Divider />
            <Row justify="end" gutter={16}>
                <Col>
                    <Button type="primary" onClick={handleSubmit}>
                        ส่งคำขอ
                    </Button>
                </Col>
                <Col>
                    <Button onClick={() => setApplication({ store_name: "", license_document_url: "", phone: "", location: "", status: "pending" })}>
                        ล้างข้อมูล
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default AppStore;
