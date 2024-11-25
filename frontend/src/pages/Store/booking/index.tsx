import { useState, useEffect } from "react";
import { Table, Typography, message, Spin, Button, Tabs } from "antd";
import { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import { BookingInterface } from "../../../interfaces/Bookingstore";
import { GetAllBookings, UpdateBookingStatus } from "../../../services/https";

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

    // ดึงข้อมูลการจองทั้งหมดที่ storeId ตรงกับ URL
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await GetAllBookings(); // ดึงข้อมูล Booking ทั้งหมด
                if (response.status === 200) {
                    // กรองข้อมูลให้แสดงเฉพาะการจองที่ storeId ตรงกับ URL
                    const filteredBookings = response.data.bookings.filter(
                        (booking: BookingInterface) => booking.store_id.toString() === storeId
                    );
                    setBookings(filteredBookings); // ตั้งค่า bookings ที่กรองแล้ว
                    // แยกข้อมูลตามสถานะ
                    setPendingBookings(filteredBookings.filter((booking: { status: string; }) => booking.status === "pending"));
                    setConfirmedBookings(filteredBookings.filter((booking: { status: string; }) => booking.status === "confirmed"));
                    setCompletedBookings(filteredBookings.filter((booking: { status: string; }) => booking.status === "completed"));
                    setCancelledBookings(filteredBookings.filter((booking: { status: string; }) => booking.status === "cancelled"));
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

    // ฟังก์ชันสำหรับการอัปเดตสถานะ
    const handleUpdateStatus = async (bookingId: number, status: string) => {
        try {
            const response = await UpdateBookingStatus(bookingId, { status });
            if (response.status === 200) {
                message.success("Booking status updated successfully.");
                // รีเฟรชข้อมูลการจอง
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.ID === bookingId ? { ...booking, status } : booking
                    )
                );
                // Update lists according to status
                setPendingBookings(prev => prev.filter(booking => booking.ID !== bookingId));
                setConfirmedBookings(prev => prev.map(booking =>
                    booking.ID === bookingId ? { ...booking, status } : booking
                ));
                setCompletedBookings(prev => prev.map(booking =>
                    booking.ID === bookingId ? { ...booking, status } : booking
                ));
                setCancelledBookings(prev => prev.map(booking =>
                    booking.ID === bookingId ? { ...booking, status } : booking
                ));
            } else {
                message.error("Failed to update booking status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Error updating status.");
        }
    };

    // ฟังก์ชันสำหรับการอัปเดตสถานะเป็น "cancelled"
    const handleCancelBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "cancelled");
    };

    // ฟังก์ชันสำหรับการอัปเดตสถานะเป็น "completed"
    const handleCompleteBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "completed");
    };

    // กำหนดคอลัมน์ของตาราง
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
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Time", dataIndex: "booking_time", key: "booking_time" },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <>
                    {record.status === "pending" && (
                        <>
                            <Button
                                onClick={() => handleUpdateStatus(record.ID, "confirmed")}
                                style={{ marginRight: 8 }}
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={() => handleCancelBooking(record.ID)}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === "confirmed" && (
                        <>
                            <Button
                                onClick={() => handleCompleteBooking(record.ID)}
                                style={{ marginRight: 8 }}
                            >
                                Complete
                            </Button>
                            <Button
                                onClick={() => handleCancelBooking(record.ID)}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === "completed" && (
                        <Button
                            disabled
                        >
                            Completed
                        </Button>
                    )}
                    {record.status === "cancelled" && (
                        <Button
                            disabled
                        >
                            Cancelled
                        </Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Bookings Management for Store {storeId}</Title>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Tabs defaultActiveKey="1">
                    {/* Tab for Pending Bookings */}
                    <TabPane tab="Pending" key="1">
                        <Table columns={columns} dataSource={pendingBookings} rowKey="ID" pagination={false} />
                    </TabPane>

                    {/* Tab for Confirmed Bookings */}
                    <TabPane tab="Confirmed" key="2">
                        <Table columns={columns} dataSource={confirmedBookings} rowKey="ID" pagination={false} />
                    </TabPane>

                    {/* Tab for Completed Bookings */}
                    <TabPane tab="Completed" key="3">
                        <Table columns={columns} dataSource={completedBookings} rowKey="ID" pagination={false} />
                    </TabPane>

                    {/* Tab for Cancelled Bookings */}
                    <TabPane tab="Cancelled" key="4">
                        <Table columns={columns} dataSource={cancelledBookings} rowKey="ID" pagination={false} />
                    </TabPane>
                </Tabs>
            )}
        </div>
    );
}

export default Booking;
