import React, { useState } from "react";
import { CreateBooking } from "../../services/https";

const BookingForm: React.FC = () => {
    const [form, setForm] = useState({
        user_id: 0,
        store_id: 0,
        service_id: 0,
        date: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const res = await CreateBooking(form);
        if (res.status === 200) {
            alert("Booking created successfully!");
        } else {
            alert("Failed to create booking");
        }
    };

    return (
        <form>
            {/* Add fields for user_id, store_id, service_id, date */}
            <button type="button" onClick={handleSubmit}>
                Create Booking
            </button>
        </form>
    );
};

export default BookingForm;
