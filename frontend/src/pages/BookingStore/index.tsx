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
import {
    CreateBooking,
    GetAllService,
    GetStoreByID,
    GetUserProfile,
    CreateBookingPets,
    GetAllPets,
    CreatePet,
    DeletePet,
} from "../../services/https";
import { StoreInterface } from "../../interfaces/Store";
import { ServiceInterface } from "../../interfaces/Service";
import { PetInterface } from "../../interfaces/Pet";
import { useParams } from "react-router-dom";
import moment from "moment";
import dayjs from "dayjs";
import { BookingInterface } from "../../interfaces/Bookingstore";

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
    const [pets, setPets] = useState<PetInterface[]>([]);
    const [selectedPets, setSelectedPets] = useState<number[]>([]);

    const { storeId } = useParams<{ storeId: string }>();
    const [bookerUserId, setBookerUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userResponse = await GetUserProfile();
                setBookerUserId(userResponse.ID || null);

                if (storeId) {
                    const storeResponse = await GetStoreByID(storeId);
                    if (storeResponse?.status === 200) {
                        setStores([storeResponse.data]);
                    }

                    const serviceResponse = await GetAllService();
                    const allServices = Array.isArray(serviceResponse.data?.data) ? serviceResponse.data.data : [];
                    const filteredServices = allServices.filter(
                        (service: { store_id: number }) => service.store_id === Number(storeId)
                    );
                    setServices(filteredServices);
                }

                const petResponse = await GetAllPets();
                const userPets = petResponse.data.data.filter(
                    (pet: { owner_id: number }) => pet.owner_id === userResponse.ID
                );
                setPets(userPets);
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
        // Basic validation for required fields
        if (!selectedService || !selectedStore || !date || !time || !contactNumber || selectedPets.length === 0) {
            message.error("Please fill all required fields!");
            return;
        }

        // Validate the date and time are in the future
        const bookingTime = `${date} ${time}`;
        const formattedDateTime = moment(bookingTime, "YYYY-MM-DD HH:mm");

        if (formattedDateTime.isBefore(moment())) {
            message.error("The selected date and time must be in the future.");
            return;
        }

        // Validate the contact number (basic phone number format, adjust as necessary)
        const phoneRegex = /^[0-9]{10}$/; // Assuming a 10-digit phone number
        if (!phoneRegex.test(contactNumber)) {
            message.error("Please enter a valid 10-digit contact number.");
            return;
        }

        // Ensure the user is logged in (bookerUserId should not be null)
        if (!bookerUserId) {
            message.error("User profile not found. Please log in.");
            return;
        }

        // Map selected pet IDs to pet objects
        const selectedPetData: PetInterface[] = selectedPets.map((petID) => {
            return pets.find((pet) => pet.ID === petID);
        }).filter((pet): pet is PetInterface => Boolean(pet));  // Ensure no undefined pets are included

        // Validate that selected pets exist and are correctly selected
        if (selectedPetData.length !== selectedPets.length) {
            message.error("Some pets are missing or invalid.");
            return;
        }

        // Prepare booking data
        const bookingData: BookingInterface = {
            booker_user_id: Number(bookerUserId),
            store_id: selectedStore,
            service_id: selectedService,
            date: formattedDateTime.toISOString(),
            booking_time: time,
            notes,
            total_cost: totalCost,
            contact_number: contactNumber,
            count_pet: selectedPets.length,
            pets: selectedPetData,
            BookerUser: await GetUserProfile(), // Assuming this returns the user profile
        };

        try {
            // Create booking
            const bookingResponse = await CreateBooking(bookingData);
            if (bookingResponse.status === 201) {
                const bookingID = bookingResponse.data.booking_id;

                // Create booking pets entries
                const bookingPetsPromises = selectedPets.map((petID) => {
                    return CreateBookingPets({
                        booking_id: bookingID,
                        pet_id: petID,
                    });
                });

                await Promise.all(bookingPetsPromises);
                message.success("Booking and associated pets created successfully!");
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
        const selectedService = services.find((service) => service.ID === serviceID);
        if (selectedService) {
            // Calculate the total cost based on the price of the selected service
            setTotalCost(selectedService.price * selectedPets.length); // Multiply by the number of selected pets
        }
    };

    const handleCountPetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCountPet = Math.max(1, Number(e.target.value));
        setCountPet(newCountPet);
        setSelectedPets((prevSelectedPets) => prevSelectedPets.slice(0, newCountPet));

        if (selectedService) {
            const service = services.find((service) => service.ID === selectedService);
            if (service) {
                setTotalCost(service.price * newCountPet);
            }
        }
    };


    const handlePetSelect = (index: number, petID: number) => {
        setSelectedPets((prevSelectedPets) => {
            const updatedSelectedPets = [...prevSelectedPets];
            updatedSelectedPets[index] = petID;
            return updatedSelectedPets;
        });
    };

    const [newPetFormVisible, setNewPetFormVisible] = useState(false);
    const [newPetData, setNewPetData] = useState({
        name: "",
        breed: "",
        age: 0,
        gender: "",
        weight: 0,
        vaccinated: "yes",
        picturePet: "",
    });


    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setNewPetData((prev) => ({
                ...prev,
                picturePet: reader.result as string,  // Correctly assign the base64 string to picturePet
            }));
        };
        reader.readAsDataURL(file); // Convert the image file to base64 string
    };

    const handleNewPetChange = (field: string, value: string | number) => {
        setNewPetData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddNewPet = async () => {
        try {
            const response = await CreatePet({
                name: newPetData.name,
                breed: newPetData.breed || "",
                age: newPetData.age ?? 0,
                weight: newPetData.weight,
                gender: newPetData.gender,
                vaccinated: newPetData.vaccinated,
                owner_id: Number(bookerUserId),
                picture_pet: newPetData.picturePet || "", // Ensure the picturePet is passed correctly
            });

            if (response.status === 201) {
                setPets((prev) => [...prev, response.data]);
                setNewPetFormVisible(false);
                setNewPetData({
                    name: "",
                    breed: "",
                    age: 0,
                    gender: "",
                    weight: 0,
                    vaccinated: "yes",
                    picturePet: "", // Reset picture after successful creation
                });
                message.success("New pet added successfully.");
            }
        } catch (error) {
            message.error("Failed to add new pet.");
        }
    };

    const handleDeletePet = async (petID: number | undefined) => {
        if (!petID) {
            message.error("No pet selected to delete.");
            return;
        }
    
        try {
            const response = await DeletePet(petID.toString());
            if (response?.status === 200) {
                message.success("Pet deleted successfully.");
                // Remove the pet from the list
                setPets((prev) => prev.filter((pet) => pet.ID !== petID));
                // Update selectedPets to remove deleted pet
                setSelectedPets((prevSelected) => prevSelected.filter((id) => id !== petID));
            } else {
                message.error("Failed to delete pet.");
            }
        } catch (error) {
            console.error("Error deleting pet:", error);
            message.error("Error deleting pet. Please try again.");
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
                            {/* Store and Service Selections */}
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
                                    onChange={handleServiceChange}
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
                            {/* Date, Time, Notes, Contact Number, Pets */}
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
                                        const selectedDateTime = moment(`${date} ${timeString}`, "YYYY-MM-DD HH:mm");
                                        if (date && selectedDateTime.isBefore(moment())) {
                                            message.error("You cannot select a past time.");
                                            return;
                                        }
                                        setTime(Array.isArray(timeString) ? timeString[0] : timeString);
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
                                    value={countPet}
                                    onChange={handleCountPetChange}
                                    min={1}
                                />
                            </div>
                            {Array.from({ length: countPet }).map((_, index) => (
                                <Card key={index} style={{ marginBottom: "10px" }}>
                                    <Text>Pet {index + 1}:</Text>
                                    <Row align="middle" justify="space-between">
                                        <Col flex="auto">
                                            <Select
                                                placeholder={`Select Pet ${index + 1}`}
                                                onChange={(value) => handlePetSelect(index, value)}
                                                style={{ width: "100%" }}
                                                value={selectedPets[index] || undefined}
                                            >
                                                {pets.map((pet) => (
                                                    <Option key={pet.ID} value={pet.ID}>{pet.name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col>
                                            <Button
                                                type="text"
                                                danger
                                                onClick={() => handleDeletePet(selectedPets[index])}
                                                disabled={!selectedPets[index]} // Disable if no pet is selected
                                            >
                                                Delete
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}

                            <div style={{ marginTop: "10px" }}>
                                <Button
                                    type="dashed"
                                    onClick={() => setNewPetFormVisible(true)}
                                    style={{ width: "100%", marginTop: "10px" }}
                                >
                                    Add New Pet
                                </Button>
                            </div>
                            {/* New Pet Form */}
                            {newPetFormVisible && (
                                <Card style={{ marginTop: "20px" }}>
                                    <Title level={4}>Add New Pet</Title>
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Input
                                            placeholder="Pet Name"
                                            value={newPetData.name}
                                            onChange={(e) => handleNewPetChange("name", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Breed"
                                            value={newPetData.breed}
                                            onChange={(e) => handleNewPetChange("breed", e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Age"
                                            value={newPetData.age}
                                            onChange={(e) => handleNewPetChange("age", Number(e.target.value))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Weight"
                                            value={newPetData.weight}
                                            onChange={(e) => handleNewPetChange("weight", Number(e.target.value))}
                                        />
                                        <Select
                                            placeholder="Gender"
                                            value={newPetData.gender}
                                            onChange={(value) => handleNewPetChange("gender", value)}
                                        >
                                            <Option value="Male">Male</Option>
                                            <Option value="Female">Female</Option>
                                        </Select>
                                        <Select
                                            placeholder="Vaccinated"
                                            value={newPetData.vaccinated}
                                            onChange={(value) => handleNewPetChange("vaccinated", value)}
                                        >
                                            <Option value="yes">Yes</Option>
                                            <Option value="no">No</Option>
                                        </Select>
                                        <div>
                                            <Text type="secondary">Pet Picture (optional)</Text>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileUpload(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <Button type="primary" onClick={handleAddNewPet}>Add Pet</Button>
                                    </Space>
                                </Card>
                            )}
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
                                    type="primary"
                                    block
                                    onClick={handleSubmit}
                                >
                                    Book Now
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BookingForm;
