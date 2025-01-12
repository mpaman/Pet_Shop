import { useState, useEffect } from "react";
import { Table, Typography, message, Spin, Avatar, Popconfirm, Button, Input, Modal, Descriptions } from "antd";
import { ColumnsType } from "antd/es/table";
import { BookingInterface } from "../../interfaces/Bookingstore";
import { GetAllBookings, GetUserProfile, GetStoreByID, DeleteBooking } from "../../services/https";
import moment from "moment";
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

function TotalBooking() {
    const [bookings, setBookings] = useState<BookingInterface[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<BookingInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [, setSearchText] = useState<string>("");

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingInterface | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await GetUserProfile();
                if (response?.ID) {
                    setUserId(response.ID);
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
                            const storeResponse = await GetStoreByID(booking.store_id.toString());
                            return {
                                ...booking,
                                Store: storeResponse.data,
                            };
                        })
                    );
                    setBookings(bookingsWithStoreData);
                    setFilteredBookings(bookingsWithStoreData);
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
            const response = await DeleteBooking(bookingId.toString());
            if (response.status === 200) {
                message.success("Booking canceled successfully.");
                setBookings((prevBookings) =>
                    prevBookings.filter((booking) => booking.ID !== bookingId)
                );
                setFilteredBookings((prevBookings) =>
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

    const handleSearch = (value: string) => {
        setSearchText(value);
        const filteredData = bookings.filter((booking) =>
            booking.Store?.name?.toLowerCase().includes(value.toLowerCase()) ||
            booking.Service?.name_service?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredBookings(filteredData);
    };

    const handleShowDetails = (booking: BookingInterface) => {
        setSelectedBooking(booking);
        setIsModalVisible(true);
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
            sorter: (a, b) => a.Store?.name.localeCompare(b.Store?.name),
            render: (_, record) => record.Store?.name || "N/A",
        },
        {
            title: "Service",
            dataIndex: "Service",
            key: "service",
            sorter: (a, b) => (a.Service?.name_service || '').localeCompare(b.Service?.name_service || ''),
            render: (_, record) => record.Service?.name_service || "N/A",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
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
                <Button onClick={() => handleShowDetails(record)}>View Details</Button>
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

    const modalContent = selectedBooking ? (
        <Descriptions title="Booking Details" bordered>
            <Descriptions.Item label="Store Name">{selectedBooking.Store?.name}</Descriptions.Item>
            <Descriptions.Item label="Service">{selectedBooking.Service?.name_service}</Descriptions.Item>
            <Descriptions.Item label="Date">{moment(selectedBooking.date).format("DD/MM/YYYY")}</Descriptions.Item>
            <Descriptions.Item label="Time">{selectedBooking.booking_time}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedBooking.status}</Descriptions.Item>
        </Descriptions>
    ) : null;

    return (
        <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "1000px" }}>
                <Title level={2} style={{ textAlign: "center" }}>Your Bookings</Title>
                <Search
                    placeholder="Search by Store or Service"
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={handleSearch}
                    style={{ marginBottom: 20 }}
                />
                {loading ? (
                    <Spin size="large" style={{ display: "block", margin: "0 auto" }} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredBookings}
                        rowKey="ID"
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </div>

            {/* Modal for booking details */}
            <Modal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={1000}
                style={{ top: 20 }} 
            >
                {modalContent}
            </Modal>

        </div>
    );
}

export default TotalBooking;
