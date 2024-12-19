import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode } from "react";
import { Table, Typography, message, Spin, Button, Tabs, Modal, Input, Row, Col, Avatar, Descriptions, Divider } from "antd";
import { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import { BookingInterface } from "../../../interfaces/Bookingstore";
import { GetAllBookings, UpdateBookingStatus, GetAllPets } from "../../../services/https";
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
    const [petDetails, setPetDetails] = useState<any>(null); // State to store pet details for a specific booking
    const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
    const [searchText, setSearchText] = useState(""); // State for search input

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

    const handleCancelBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "cancelled");
    };

    const handleCompleteBooking = async (bookingId: number) => {
        await handleUpdateStatus(bookingId, "completed");
    };

    const handleShowPetDetails = async (bookingId: number) => {
        try {
            const petResponse = await GetAllPets();
            console.log("Pet Response Data:", petResponse.data); // Log to inspect the response

            if (Array.isArray(petResponse.data.data)) {
                const pets = petResponse.data.data.filter((pet: any) => pet.booking_id === bookingId);

                if (pets.length > 0) {
                    setPetDetails(pets);
                    setIsModalVisible(true);
                } else {
                    console.error("No pets found for this booking.");
                    message.error("No pets found for this booking.");
                }
            } else {
                console.error("Pet response data is not an array:", petResponse.data);
                message.error("Pet details are not in the expected format.");
            }
        } catch (error) {
            console.error("Error fetching pet details:", error);
            message.error("Unable to load pet details.");
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.BookerUser?.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.BookerUser?.last_name.toLowerCase().includes(searchText.toLowerCase())
    );

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
            width: 250, // Set the column width
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
                    {record.status !== "completed" && record.status !== "cancelled" && (
                        <Button onClick={() => handleShowPetDetails(record.ID)}>Show Pet Details</Button>
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
            <Input.Search
                placeholder="Search for customer"
                onSearch={handleSearch}
                style={{ marginBottom: 20 }}
            />
            {loading ? (
                <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
            ) : (
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Pending" key="1">
                        <Table columns={columns} dataSource={filteredBookings.filter((booking) => booking.status === "pending")} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Confirmed" key="2">
                        <Table columns={columns} dataSource={filteredBookings.filter((booking) => booking.status === "confirmed")} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Completed" key="3">
                        <Table columns={columns} dataSource={filteredBookings.filter((booking) => booking.status === "completed")} rowKey="ID" pagination={false} />
                    </TabPane>
                    <TabPane tab="Cancelled" key="4">
                        <Table columns={columns} dataSource={filteredBookings.filter((booking) => booking.status === "cancelled")} rowKey="ID" pagination={false} />
                    </TabPane>
                </Tabs>
            )}

            <Modal
                title="Pet Details"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {petDetails && petDetails.length > 0 ? (
                    <div>
                        {petDetails.map((pet: { picture_pet: any; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; breed: any; age: any; weight: any; vaccinated: any; gender: any; }, index: Key | null | undefined) => (
                            <div key={index} style={{ marginBottom: "20px" }}>
                                <Row gutter={16} align="middle">
                                    {/* Pet image */}
                                    <Col span={6}>
                                        <img
                                            src={pet.picture_pet || "https://via.placeholder.com/100"}
                                            alt={pet.name}
                                            style={{
                                                width: '100%',  // ขยายให้เต็มความกว้างของคอลัมน์
                                                height: 'auto', // คงอัตราส่วนความสูง
                                                borderRadius: '8px' // ถ้าต้องการมุมโค้งเล็กน้อย
                                            }}
                                        />
                                    </Col>

                                    {/* Pet details */}
                                    <Col span={18}>
                                        <Descriptions bordered column={1} style={{ marginLeft: 20 }}>
                                            <Descriptions.Item label="Pet Name">{pet.name}</Descriptions.Item>
                                            <Descriptions.Item label="Breed">{pet.breed || "N/A"}</Descriptions.Item>
                                            <Descriptions.Item label="Age">{pet.age ? `${pet.age} years` : "N/A"}</Descriptions.Item>
                                            <Descriptions.Item label="Weight">{pet.weight ? `${pet.weight} kg` : "N/A"}</Descriptions.Item>
                                            <Descriptions.Item label="Vaccinated">{pet.vaccinated || "N/A"}</Descriptions.Item>
                                            <Descriptions.Item label="Gender">{pet.gender || "N/A"}</Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>
                                <Divider />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No pet details available.</p>
                )}
            </Modal>
        </div>
    );
}

export default Booking;
