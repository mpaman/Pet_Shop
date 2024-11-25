import { useState, useEffect } from "react";
import { Table, Typography, message, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import { BookingInterface } from "../../interfaces/Bookingstore";
import { GetAllBookings, GetUserProfile } from "../../services/https";
import { Link } from "react-router-dom";

const { Title } = Typography;

function TotalBooking() {
    const [bookings, setBookings] = useState<BookingInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string | null>(null); // state สำหรับเก็บ userId

    // ดึงข้อมูลผู้ใช้ที่ล็อกอิน
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await GetUserProfile(); // ดึงข้อมูล user profile
                setUserId(response.ID); // เก็บ userId ที่ดึงมา
                console.log("User ID from profile:", response.ID); // ตรวจสอบว่า userId ถูกต้องหรือไม่
            } catch (error) {
                console.error("Error fetching user profile:", error);
                message.error("Error fetching user profile.");
            }
        };
        fetchUserProfile();
    }, []); // เรียกใช้แค่ครั้งเดียวเมื่อ component ถูก mount

    // ดึงข้อมูลการจองทั้งหมด
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await GetAllBookings(); // ดึงข้อมูล Booking ทั้งหมด
                console.log("Bookings data:", response.data.bookings); // ตรวจสอบข้อมูล bookings ที่ได้จาก API
                if (response.status === 200) {
                    // ถ้ามี userId, กรองข้อมูลการจองให้แสดงเฉพาะที่ BookerUser.ID ตรงกับ userId
                    const filteredBookings = response.data.bookings.filter(
                        (booking: BookingInterface) => booking.booker_user_id === Number(userId) // แก้ไขการเปรียบเทียบ
                    );
                    console.log("Filtered Bookings:", filteredBookings); // ตรวจสอบการกรองข้อมูล
                    setBookings(filteredBookings); // ตั้งค่า bookings ที่กรองแล้ว
                } else {
                    message.error("Failed to load bookings.");
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                message.error("Error fetching bookings.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBookings(); // ดึงข้อมูลการจองเมื่อ userId ถูกตั้งค่า
        }
    }, [userId]); // เรียกใช้ effect นี้เมื่อ userId เปลี่ยนแปลง

    // กำหนดคอลัมน์ของตาราง
    const columns: ColumnsType<BookingInterface> = [
        { title: "Booking ID", dataIndex: "ID", key: "ID" },
        {
            title: "Customer Name",
            dataIndex: "BookerUser",
            key: "BookerUser",
            render: (_, record) =>
                record.BookerUser ? `${record.BookerUser.first_name} ${record.BookerUser.last_name}` : "N/A",
        },
        {
            title: "Service",
            dataIndex: "Service",
            key: "Service",
            render: (_, record) => record.Service?.name_service || "N/A", // แสดงชื่อบริการจาก service
        },
        { title: "Date", dataIndex: "date", key: "date" }, // ใช้ `date` จาก `BookingInterface`
        { title: "Time", dataIndex: "booking_time", key: "booking_time" }, // ใช้ `booking_time` จาก `BookingInterface`
        { title: "Status", dataIndex: "status", key: "status" }, // ใช้ `status` จาก `BookingInterface`
        {
            title: "หน้าของโพสต์",
            key: "store_id",
            render: (record) => (
                <Link to={`/stores/${record.store_id}`}>ดูรายละเอียดโพสต์</Link>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Your Bookings</Title>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table columns={columns} dataSource={bookings} rowKey="ID" />
            )}
        </div>
    );
}

export default TotalBooking;
