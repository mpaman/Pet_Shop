export interface BookingInterface {
    BookerUser: any;
    ID?: number;
    booker_user_id: number;
    store_id: number;
    service_id: number;
    date: string; // ISO format (required)
    booking_time: string; 
    status?: string; // Optional
    notes: string; // Optional
    total_cost: number; // Required
    contact_number: string; // Required
    count_pet: number; // Required

    User?: { // Optional User information
        ID: number; // User's ID (required)
        first_name: string; // User's first name (required)
        last_name: string;  // User's last name (required)
        email: string;      // User's email (required)
        Profile?: string;   // Optional profile image
    };

    store?: { // Optional Store information
        name: string;       // Store's name (required)
        location: string;   // Store's location (required)
        contact_info: string; // Store's contact information (required)
        description: string; // Store's description (required)
        time_open: string;  // Store's working hours (required)
        status: string;     // Store's status (required)
    };

    Service?: { // Optional Service information
        name_service: string; // Service's name (required)
        price: number;        // Service's price (required)
        duration: number;     // Service's duration (required)
    };
}
