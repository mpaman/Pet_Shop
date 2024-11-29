import { useState, useEffect } from "react";
import { Table, Typography, message, Spin, Avatar, Row, Col } from "antd";
import { ColumnsType } from "antd/es/table";
import { BookingInterface } from "../../interfaces/Bookingstore";
import { GetAllBookings, GetUserProfile, GetStoreByID } from "../../services/https";
import { Link } from "react-router-dom";
import moment from "moment";

const { Title } = Typography;

function TotalBooking() {
    const [bookings, setBookings] = useState<BookingInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | null>(null);

    // ดึงข้อมูลโปรไฟล์ผู้ใช้
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await GetUserProfile();
                if (response?.ID) {
                    setUserId(response.ID); // บันทึก User ID
                    console.log("User ID from profile:", response.ID);
                } else {
                    message.error("User profile not found.");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                message.error("Error fetching user profile.");
            }
        };
        fetchUserProfile();
    }, []);

    // ดึงข้อมูลการจอง
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await GetAllBookings();
                if (response.status === 200) {
                    const filteredBookings = response.data.bookings.filter(
                        (booking: BookingInterface) => booking.booker_user_id === userId
                    );
                    const bookingsWithStoreData = await Promise.all(
                        filteredBookings.map(async (booking: BookingInterface) => {
                            const storeResponse = await GetStoreByID(booking.store_id);
                            return {
                                ...booking,
                                Store: storeResponse.data, // เพิ่มข้อมูลร้านค้า
                            };
                        })
                    );
                    setBookings(bookingsWithStoreData);
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

    // คอลัมน์ของตาราง
    const columns: ColumnsType<BookingInterface> = [
        {
            title: "Store",
            dataIndex: "Store",
            key: "owner",
            render: (_, record) => {
                const user = record.Store?.user;
                if (!user) return "N/A";

                const profileSrc = user.Profile?.startsWith("data:image")
                    ? user.Profile
                    : user.Profile
                        ? `data:image/png;base64,${user.Profile}`
                        : null;
                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            src={profileSrc}
                            alt={user.first_name}
                            size={64} // เพิ่มขนาดของ Avatar ให้ใหญ่ขึ้น
                            style={{ marginRight: "8px" }}
                        />
                    </div>
                );
            },
        },
        {
            title: "Store Name",
            dataIndex: "Store",
            key: "store",
            render: (_, record) => record.Store?.name || "N/A",
        },

        {
            title: "Service",
            dataIndex: "Service",
            key: "service",
            render: (_, record) => record.Service?.name_service || "N/A",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
        },
        {
            title: "Time",
            dataIndex: "booking_time",
            key: "time",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Details",
            key: "store_id",
            render: (record) => (
                <Link to={`/stores/${record.store_id}`}>View Store Details</Link>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1000px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>Your Bookings</Title>
                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: '0 auto' }} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={bookings}
                        rowKey="ID"
                        pagination={{ pageSize: 5 }} // เพิ่ม Pagination
                    />
                )}
            </div>
        </div>
    );
}

export default TotalBooking;
