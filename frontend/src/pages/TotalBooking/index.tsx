import { useState, useEffect } from "react";
import { Table, Typography, message, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import { BookingInterface } from "../../interfaces/Bookingstore";
import { GetAllBookings, GetUserProfile, GetStoreByID } from "../../services/https";
import { Link } from "react-router-dom";
import moment from "moment";  // นำเข้า moment

const { Title } = Typography;

function TotalBooking() {
    const [bookings, setBookings] = useState<BookingInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string | null>(null);

    // ดึงข้อมูลผู้ใช้ที่ล็อกอิน
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await GetUserProfile();
                setUserId(response.ID);
                console.log("User ID from profile:", response.ID);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                message.error("Error fetching user profile.");
            }
        };
        fetchUserProfile();
    }, []);

    // ดึงข้อมูลการจองทั้งหมด
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await GetAllBookings();
                if (response.status === 200) {
                    const filteredBookings = response.data.bookings.filter(
                        (booking: BookingInterface) => booking.booker_user_id === Number(userId)
                    );
                    setBookings(filteredBookings);
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
            fetchBookings();
        }
    }, [userId]);

    // กำหนดคอลัมน์ของตาราง
    const columns: ColumnsType<BookingInterface> = [
        {
            title: "Store name",
            dataIndex: "BookerUser",
            key: "BookerUser",
            render: (_, record) =>
                record.BookerUser ? `${record.Store?.name}` : "N/A",
        },
        {
            title: "Service",
            dataIndex: "Service",
            key: "Service",
            render: (_, record) => record.Service?.name_service || "N/A",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => {
                return date ? moment(date).format("DD/MM/YYYY") : "N/A";  // ใช้ moment เพื่อจัดรูปแบบวันที่
            },
        },
        {
            title: "Time",
            dataIndex: "booking_time",
            key: "booking_time",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
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
