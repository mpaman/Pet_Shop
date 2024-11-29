import { useState, useEffect } from "react";
import { Table, Typography, message, Spin, Button, Tabs } from "antd";
import { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import { BookingInterface } from "../../../interfaces/Bookingstore";
import { GetAllBookings, UpdateBookingStatus } from "../../../services/https";
import moment from "moment";

const { Title } = Typography;
const { TabPane } = Tabs;

function Booking() {
    const { id: storeId } = useParams<{ id: string }>(); // store id
    const [bookings, setBookings] = useState<BookingInterface[]>([]); // All bookings
    const [pendingBookings, setPendingBookings] = useState<BookingInterface[]>([]); // For pending bookings
    const [confirmedBookings, setConfirmedBookings] = useState<BookingInterface[]>([]); // For confirmed bookings
    const [completedBookings, setCompletedBookings] = useState<BookingInterface[]>([]); // For completed bookings
    const [cancelledBookings, setCancelledBookings] = useState<BookingInterface[]>([]); // For cancelled bookings
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await GetAllBookings();
                if (response.status === 200) {
                    const filteredBookings = response.data.bookings.filter(
                        (booking: BookingInterface) => booking.store_id.toString() === storeId
                    );
                    setBookings(filteredBookings);
                    setPendingBookings(filteredBookings.filter((booking) => booking.status === "pending"));
                    setConfirmedBookings(filteredBookings.filter((booking) => booking.status === "confirmed"));
                    setCompletedBookings(filteredBookings.filter((booking) => booking.status === "completed"));
                    setCancelledBookings(filteredBookings.filter((booking) => booking.status === "cancelled"));
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
        fetchBookings();
    }, [storeId]);

    const handleUpdateStatus = async (bookingId: number, status: string) => {
        try {
            const response = await UpdateBookingStatus(bookingId, { status });
            if (response.status === 200) {
                message.success("Booking status updated successfully.");
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.ID === bookingId ? { ...booking, status } : booking
                    )
                );
                setPendingBookings((prev) => prev.filter((booking) => booking.ID !== bookingId));
            } else {
                message.error("Failed to update booking status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Error updating status.");
        }
    };

    // ฟังก์ชันยกเลิกการจอง
    const handleCancelBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "cancelled");
    };

    // ฟังก์ชันเสร็จสิ้นการจอง
    const handleCompleteBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "completed");
    };

    const columns: ColumnsType<BookingInterface> = [
        {
            title: "Customer Name",
            dataIndex: "BookerUser",
            key: "BookerUser",
            render: (_, record) =>
                record.BookerUser ? `${record.BookerUser.first_name} ${record.BookerUser.last_name}` : "N/A",
        },
        { title: "Service", dataIndex: "Service", key: "Service", render: (_, record) => record.Service?.name_service || "N/A" },
        { title: "Contact", dataIndex: "contact_number", key: "contact_number" },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
        },
        { title: "Time", dataIndex: "booking_time", key: "booking_time" },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "Actions",
            key: "actions",
            width: 250, // กำหนดความกว้างสำหรับคอลัมน์
            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {record.status === "pending" && (
                        <>
                            <Button
                                onClick={() => handleUpdateStatus(record.ID, "confirmed")}
                                type="primary"
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={() => handleCancelBooking(record.ID)}
                                danger
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === "confirmed" && (
                        <>
                            <Button
                                onClick={() => handleCompleteBooking(record.ID)}
                                type="primary"
                            >
                                Complete
                            </Button>
                            <Button
                                onClick={() => handleCancelBooking(record.ID)}
                                danger
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === "completed" && (
                        <Button disabled>Completed</Button>
                    )}
                    {record.status === "cancelled" && (
                        <Button disabled>Cancelled</Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "20px",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                backgroundColor: "#fff",
            }}
        >
            <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
                Bookings Management for Store {storeId}
            </Title>
            {loading ? (
                <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
            ) : (
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Pending" key="1">
                        <Table columns={columns} dataSource={pendingBookings} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Confirmed" key="2">
                        <Table columns={columns} dataSource={confirmedBookings} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Completed" key="3">
                        <Table columns={columns} dataSource={completedBookings} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Cancelled" key="4">
                        <Table columns={columns} dataSource={cancelledBookings} rowKey="ID" pagination={false} />
                    </TabPane>
                </Tabs>
            )}
        </div>
    );
}

export default Booking;
