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
import { CreateBooking, GetAllService, GetStoreByID, GetUserProfile, CreatePet } from "../../services/https";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { useParams } from "react-router-dom";
import moment from "moment";
import dayjs from "dayjs";

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
    const [pets, setPets] = useState<{
        name: string;
        breed?: string;
        age?: number;
        gender: string;
        weight: number;
        vaccinated: string;
        picturePet?: string;
    }[]>([
        { name: "", breed: "", age: 0, gender: "", weight: 0, vaccinated: "yes" },
    ]);

    const { storeId } = useParams<{ storeId: string }>();
    const [bookerUserId, setBookerUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const storeResponse = storeId ? await GetStoreByID(storeId) : null;
                if (storeResponse?.status === 200) {
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

    const handlePetChange = (index: number, field: string, value: any) => {
        const updatedPets = [...pets];
        updatedPets[index] = { ...updatedPets[index], [field]: value };

        if (field === "age" || field === "weight") {
            updatedPets[index][field] = Math.max(0, value); // Ensure no negative values
        }

        setPets(updatedPets);
    };

    const handleFileUpload = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const updatedPets = [...pets];
            updatedPets[index].picturePet = reader.result as string;
            setPets(updatedPets);
        };
        reader.readAsDataURL(file);
    };
    const handleSubmit = async () => {
        if (!selectedService || !selectedStore || !date || !contactNumber || !countPet || !time) {
            message.error("Please fill all required fields!");
            return;
        }
    
        const bookingTime = `${date} ${time || "00:00"}`;
        const formattedDateTime = moment(bookingTime, "YYYY-MM-DD HH:mm");
    
        // ตรวจสอบวันและเวลา
        if (formattedDateTime.isBefore(moment())) {
            message.error("The selected date and time must be in the future.");
            return;
        }
    
        // ตรวจสอบโปรไฟล์ผู้ใช้งาน
        if (!bookerUserId) {
            message.error("User profile not found. Please log in.");
            return;
        }
    
        // ตรวจสอบข้อมูลสัตว์เลี้ยง
        if (pets.some(pet => !pet.name || !pet.weight || !pet.gender)) {
            message.error("Please fill in all required pet information.");
            return;
        }
    
        const bookingData = {
            booker_user_id: Number(bookerUserId),
            store_id: selectedStore,
            service_id: selectedService,
            date: formattedDateTime.toISOString(),
            notes: notes,
            total_cost: totalCost,
            contact_number: contactNumber,
            count_pet: pets.length,
            booking_time: time,
            pets: pets.map((pet) => ({
                name: pet.name,
                breed: pet.breed || "",
                age: pet.age ?? 0,
                weight: pet.weight,
                gender: pet.gender,
                vaccinated: pet.vaccinated,
                owner_id: Number(bookerUserId),
                picture_pet: pet.picturePet || "",
            })),
            BookerUser: {
                id: Number(bookerUserId),
                name: "Default User",  // เปลี่ยนตามที่ได้จาก GetUserProfile()
                email: "default@example.com",  // เปลี่ยนตามที่ได้จาก GetUserProfile()
            },
        };
    
        try {
            const response = await CreateBooking(bookingData);
            if (response.status === 201) {
                const bookingID = response.data.booking_id;
    
                // บันทึกข้อมูลสัตว์เลี้ยง
                const petPromises = pets.map((pet) =>
                    CreatePet({
                        booking_id: bookingID,
                        name: pet.name,
                        breed: pet.breed || "",
                        age: pet.age ?? 0,
                        weight: pet.weight,
                        gender: pet.gender,
                        vaccinated: pet.vaccinated,
                        owner_id: Number(bookerUserId),
                        picture_pet: pet.picturePet,
                    })
                );
    
                await Promise.all(petPromises);
                message.success("Booking and pets created successfully!");
            } else {
                message.error("Failed to create booking.");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            message.error("Error creating booking. Please try again later.");
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
        const newCountPet = Math.max(1, Number(e.target.value)); // Ensure at least 1 pet
        setCountPet(newCountPet);

        const updatedPets = [...pets];
        if (newCountPet > pets.length) {
            const additionalPets = Array(newCountPet - pets.length).fill({
                name: "",
                breed: "",
                age: 0,
                gender: "",
                weight: 0,
                vaccinated: "yes",
            });
            setPets([...updatedPets, ...additionalPets]);
        } else if (newCountPet < pets.length) {
            setPets(updatedPets.slice(0, newCountPet));
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
                            {/* Booking Fields */}
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
                                    onChange={(date, dateString) => {
                                        if (date && dayjs(date).isBefore(dayjs(), "day")) {
                                            message.error("You cannot select a past date.");
                                            return;
                                        }
                                        setDate(Array.isArray(dateString) ? dateString[0] : dateString);
                                    }}
                                />
                            </div>
                            <div>
                                <Text strong>Time:</Text>
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    onChange={(_time, timeString) => {
                                        if (typeof timeString === 'string') {
                                            const selectedDateTime = moment(`${date} ${timeString}`, "YYYY-MM-DD HH:mm");
                                            if (date && selectedDateTime.isBefore(moment())) {
                                                message.error("You cannot select a past time.");
                                                return;
                                            }
                                            setTime(timeString);
                                        }
                                    }}
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

                            {/* Pet Information Fields */}
                            <div>
                                <Text strong >Pet Information:</Text>
                                {pets.map((pet, index) => (
                                    <Card key={index} style={{ marginBottom: "10px" }}>
                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <div>
                                                <Text type="secondary">Pet Name (required)</Text>
                                                <Input
                                                    placeholder="Enter your pet's name"
                                                    value={pet.name}
                                                    onChange={(e) => handlePetChange(index, "name", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Text type="secondary">Breed (optional)</Text>
                                                <Input
                                                    placeholder="Enter your pet's breed"
                                                    value={pet.breed}
                                                    onChange={(e) => handlePetChange(index, "breed", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Text type="secondary">Age (optional)</Text>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter your pet's age"
                                                    value={pet.age}
                                                    onChange={(e) => handlePetChange(index, "age", Number(e.target.value))}
                                                />
                                            </div>

                                            <div>
                                                <Text type="secondary">Weight (required)</Text>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter your pet's weight"
                                                    value={pet.weight}
                                                    onChange={(e) => handlePetChange(index, "weight", Number(e.target.value))}
                                                />
                                            </div>

                                            <div>
                                                <Text type="secondary">Vaccinated (required)</Text>
                                                <Select
                                                    placeholder="Select vaccination status"
                                                    value={pet.vaccinated}
                                                    onChange={(value) => handlePetChange(index, "vaccinated", value)}
                                                >
                                                    <Option value="Yes">Yes</Option>
                                                    <Option value="No">No</Option>
                                                </Select>
                                            </div>

                                            <div>
                                                <Text type="secondary">Gender (required)</Text>
                                                <Select
                                                    placeholder="Select your pet's gender"
                                                    value={pet.gender || undefined}
                                                    onChange={(value) => handlePetChange(index, "gender", value)}
                                                >
                                                    <Option value="Male">Male</Option>
                                                    <Option value="Female">Female</Option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Text type="secondary">Pet Picture (optional)</Text>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) { // Check if files is not null
                                                            handleFileUpload(index, e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Space>
                                    </Card>
                                ))}
                            </div>


                            <div>
                                <Text strong>Total Cost:</Text>
                                <Paragraph>{totalCost} THB</Paragraph>
                            </div>

                            <div>
                                <Button
                                    style={{
                                        marginTop: "10px",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                    }}
                                    type="primary" block onClick={handleSubmit}>
                                    Book Now
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Title level={4} >Booking Summary</Title>
                        <Paragraph>
                            <strong>Store:</strong> {stores.find((store) => store.ID === selectedStore)?.name || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Service:</strong> {services.find((service) => service.ID === selectedService)?.name_service || "N/A"}
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
                            <strong>Date:</strong> {date || "N/A"}
                        </Paragraph>
                        <Paragraph>
                            <strong>Time:</strong> {time || "N/A"}
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BookingForm;
