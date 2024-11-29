import React, { useEffect, useState } from "react";
import {
    Card,
    Typography,
    Select,
    DatePicker,
    Input,
    Space,
    Button,
    Divider,
    message,
    Row,
    Col,
    TimePicker,
} from "antd";
import { CreateBooking, GetAllService, GetStoreByID, GetUserProfile } from "../../services/https";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { useParams } from "react-router-dom";
import moment from "moment"; // ใช้สำหรับการจัดการเวลา

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const BookingForm: React.FC = () => {
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedStore, setSelectedStore] = useState<number | null>(null);
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string | null>(null);
    const [notes, setNotes] = useState<string>("");
    const [contactNumber, setContactNumber] = useState<string>("");
    const [totalCost, setTotalCost] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [countPet, setCountPet] = useState<number>(1);
    const { storeId } = useParams<{ storeId: string }>();
    const [bookerUserId, setBookerUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const storeResponse = await GetStoreByID(storeId);
                if (storeResponse.status === 200) {
                    setStores([storeResponse.data]);
                }

                const serviceResponse = await GetAllService();
                const allServices = Array.isArray(serviceResponse.data?.data) ? serviceResponse.data.data : [];
                const filteredServices = allServices.filter(
                    (service: { store_id: number }) => service.store_id === Number(storeId)
                );

                setServices(filteredServices);

                const userResponse = await GetUserProfile();
                setBookerUserId(userResponse.ID || "No ID");
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        if (storeId) fetchData();
    }, [storeId]);

    const handleSubmit = async () => {
        if (!selectedService || !selectedStore || !date || !contactNumber || !countPet || !time) {
            message.error("Please fill all required fields!");
            return;
        }

        const formattedDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").toISOString();

        const bookingData = {
            booker_user_id: bookerUserId,
            store_id: selectedStore,
            service_id: selectedService,
            date: formattedDateTime,
            notes,
            total_cost: totalCost,
            contact_number: contactNumber,
            count_pet: countPet,
            booking_time: time,
        };

        try {
            const response = await CreateBooking(bookingData);
            if (response.status === 201) {
                message.success("Booking created successfully!");
            } else {
                message.error("Failed to create booking.");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            message.error("Error creating booking.");
        }
    };

    const handleServiceChange = (serviceID: number) => {
        setSelectedService(serviceID);
        const selected = services.find((service) => service.ID === serviceID);
        if (selected) {
            setTotalCost(selected.price * countPet);
        }
    };

    const handleCountPetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCountPet = Number(e.target.value);
        setCountPet(newCountPet);

        if (selectedService) {
            const selected = services.find((service) => service.ID === selectedService);
            if (selected) {
                setTotalCost(selected.price * newCountPet);
            }
        }
    };

    return (
        <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
            <Row gutter={[16, 16]} style={{ maxWidth: "1200px", width: "100%" }}>
                <Col xs={24} md={16}>
                    <Card loading={loading} style={{ borderRadius: "8px", padding: "20px" }}>
                        <Title level={2} style={{ textAlign: "center", color: "#1D3557" }}>Book a Service</Title>
                        <Divider />
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <div>
                                <Text strong>Store:</Text>
                                <Select
                                    placeholder="Select a store"
                                    style={{ width: "100%" }}
                                    onChange={(value) => setSelectedStore(value)}
                                    value={selectedStore || undefined}
                                >
                                    {stores.map((store) => (
                                        <Option key={store.ID} value={store.ID}>
                                            {store.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Text strong>Service:</Text>
                                <Select
                                    placeholder="Select a service"
                                    style={{ width: "100%" }}
                                    onChange={(value) => handleServiceChange(value)}
                                    value={selectedService || undefined}
                                >
                                    {services
                                        .filter((service) => service.store_id === selectedStore)
                                        .map((service) => (
                                            <Option key={service.ID} value={service.ID}>
                                                {service.name_service} - {service.price} THB
                                            </Option>
                                        ))}
                                </Select>
                            </div>
                            <div>
                                <Text strong>Date:</Text>
                                <DatePicker
                                    style={{ width: "100%" }}
                                    onChange={(date, dateString) => setDate(dateString)}
                                />
                            </div>
                            <div>
                                <Text strong>Time:</Text>
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    onChange={(time, timeString) => setTime(timeString)}
                                />
                            </div>
                            <div>
                                <Text strong>Notes:</Text>
                                <Input.TextArea
                                    placeholder="Additional information"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div>
                                <Text strong>Contact Number:</Text>
                                <Input
                                    placeholder="Enter your contact number"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <Text strong>Number of Pets:</Text>
                                <Input
                                    type="number"
                                    placeholder="Enter the number of pets"
                                    value={countPet}
                                    onChange={handleCountPetChange}
                                    min={1}
                                />
                            </div>
                            <div>
                                <Text strong>Total Cost:</Text>
                                <Paragraph>{totalCost} THB</Paragraph>
                            </div>
                            <Button type="primary" block onClick={handleSubmit}>
                                Book Now
                            </Button>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Title level={4}>Booking Summary</Title>
                        <Paragraph>
                            <strong>Store:</strong> {stores.find((store) => store.ID === selectedStore)?.name || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <br></br><strong>Service:</strong> {services.find((service) => service.ID === selectedService)?.name_service || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Price:</strong> {services.find((service) => service.ID === selectedService)?.price || "N/A"} THB
                        </Paragraph>
                        <Paragraph>
                            <strong>Duration:</strong> {services.find((service) => service.ID === selectedService)?.duration || "N/A"} minutes
                        </Paragraph>
                        <Paragraph>
                            <strong>Category:</strong> {services.find((service) => service.ID === selectedService)?.category_pet || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <br></br><strong>Date:</strong> {date || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Time:</strong> {time || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Contact Number:</strong> {contactNumber || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Pets:</strong> {countPet || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Total Cost:</strong> {totalCost} THB
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BookingForm;
