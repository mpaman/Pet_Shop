import { useState, useEffect } from "react";
import { Table, Typography, message, Spin, Avatar, Popconfirm, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import { BookingInterface } from "../../interfaces/Bookingstore";
import { GetAllBookings, GetUserProfile, GetStoreByID, DeleteBooking } from "../../services/https";
import { Link } from "react-router-dom";
import moment from "moment";
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

function TotalBooking() {
    const [bookings, setBookings] = useState<BookingInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await GetUserProfile();
                if (response?.ID) {
                    setUserId(response.ID); // Save User ID
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
                            // Convert store_id to string
                            const storeResponse = await GetStoreByID(booking.store_id.toString());
                            return {
                                ...booking,
                                Store: storeResponse.data, // Add store data
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

    const handleDeleteBooking = async (bookingId: number) => {
        try {
            // Convert bookingId to string
            const response = await DeleteBooking(bookingId.toString());
            if (response.status === 200) {
                message.success("Booking canceled successfully.");
                setBookings((prevBookings) =>
                    prevBookings.filter((booking) => booking.ID !== bookingId)
                );
            } else {
                message.error("Failed to cancel booking.");
            }
        } catch (error) {
            console.error("Error canceling booking:", error);
            message.error("Error canceling booking.");
        }
    };

    const columns: ColumnsType<BookingInterface> = [
        {
            title: "Profile Image",
            dataIndex: "profile_image",
            key: "profile_image",
            render: (_, record) => {
                const profileImage = record.Store?.profile_image;
                return profileImage ? (
                    <Avatar src={profileImage} alt="Profile" size={64} style={{ marginRight: "8px" }} />
                ) : (
                    <Avatar icon={<UserOutlined />} size={64} style={{ marginRight: "8px" }} />
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
        {
            title: "Actions",
            key: "actions",
            render: (record) => (
                <Popconfirm
                    title="Are you sure you want to cancel this booking?"
                    onConfirm={() => handleDeleteBooking(record.ID)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>
                        Cancel
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "1000px" }}>
                <Title level={2} style={{ textAlign: "center" }}>Your Bookings</Title>
                {loading ? (
                    <Spin size="large" style={{ display: "block", margin: "0 auto" }} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={bookings}
                        rowKey="ID"
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </div>
        </div>
    );
}

export default TotalBooking;
