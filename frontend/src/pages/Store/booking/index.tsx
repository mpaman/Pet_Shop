import { useState, useEffect, useMemo } from "react";
import { Table, Typography, message, Spin, Button, Tabs, Modal, Input, Row, Col, Descriptions, Divider } from "antd";
import { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import { BookingInterface } from "../../../interfaces/Bookingstore";
import { GetAllBookings, UpdateBookingStatus, GetAllPets, GetPetsByBookingID } from "../../../services/https";
import moment from "moment";

const { Title } = Typography;
const { TabPane } = Tabs;

interface PetDetails {
    booking_id: number;
    picture_pet: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    vaccinated: string;
    gender: string;
}

function Booking() {
    const { id: storeId } = useParams<{ id: string }>(); // store id
    const [bookings, setBookings] = useState<BookingInterface[]>([]); // All bookings
    const [loading, setLoading] = useState<boolean>(true);
    const [petDetails, setPetDetails] = useState<PetDetails[]>([]); // State to store pet details for a specific booking
    const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
    const [searchText, setSearchText] = useState(""); // State for search input
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);

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
            const petsData: never[] = [];
            const response = await UpdateBookingStatus(bookingId.toString(), {
                status,
                pets: petsData,
                BookerUser: undefined,
                booker_user_id: 0,
                store_id: 0,
                service_id: 0,
                date: "",
                booking_time: "",
                total_cost: 0,
                contact_number: "",
                count_pet: 0,
            });

            if (response.status === 200) {
                message.success("Booking status updated successfully.");
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.ID === bookingId ? { ...booking, status } : booking
                    )
                );
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
            const response = await GetPetsByBookingID(bookingId.toString());
            if (response.status === 200) {
                const pets = response.pets.map((petDetails: any) => ({
                    booking_id: petDetails.booking_id,
                    picture_pet: petDetails.pet.picture_pet,
                    name: petDetails.pet.name,
                    breed: petDetails.pet.breed,
                    age: petDetails.pet.age,
                    weight: petDetails.pet.weight,
                    vaccinated: petDetails.pet.vaccinated,
                    gender: petDetails.pet.gender,
                }));

                setPetDetails(pets);
                setIsModalVisible(true);
            } else {
                message.error("Failed to load pet details.");
            }
        } catch (error) {
            console.error("Error fetching pet details:", error);
            message.error("Unable to load pet details.");
        }
    };




    const handleShowNote = (note: string) => {
        setSelectedNote(note);
        setIsNoteModalVisible(true);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) =>
            booking.BookerUser?.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
            booking.BookerUser?.last_name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [bookings, searchText]);

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
        // { title: "Note", dataIndex: "notes", key: "notes" },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "Actions",
            key: "actions",
            width: 250,
            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {record.status === "pending" && (
                        <>
                            <Button
                                onClick={() => record.ID && handleUpdateStatus(record.ID, "confirmed")}
                                type="primary"
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={() => record.ID && handleCancelBooking(record.ID)}
                                danger
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === "confirmed" && (
                        <>

                            <Button
                                style={{
                                    marginTop: "10px",
                                    background: "#E63946",
                                    color: "white",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                }}
                                onClick={() => record.ID && handleCompleteBooking(record.ID)}
                                type="primary"
                            >
                                Complete
                            </Button>
                            <Button
                                style={{
                                    marginTop: "10px",
                                    background: "#E63946",
                                    color: "white",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                }}
                                onClick={() => record.ID && handleCancelBooking(record.ID)}
                                danger
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status !== "completed" && record.status !== "cancelled" && (
                        <Button onClick={() => record.ID && handleShowPetDetails(record.ID)}>Show Pet Details</Button>
                    )}
                    <Button onClick={() => record.notes && handleShowNote(record.notes)}>Show Note</Button>
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
                Bookings Management for Store
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
                title="Booking Note"
                visible={isNoteModalVisible}
                onCancel={() => setIsNoteModalVisible(false)}
                footer={null}
            >
                <p>{selectedNote}</p>
            </Modal>

            <Modal
                title="Pet Details"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {petDetails.length > 0 ? (
                    <div>
                        {petDetails.map((pet: PetDetails, index) => (
                            <div key={index} style={{ marginBottom: "20px" }}>
                                <Row gutter={16} align="middle">
                                    <Col span={6}>
                                        <img
                                            src={pet.picture_pet || "https://via.placeholder.com/100"}
                                            alt={pet.name}
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </Col>
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
