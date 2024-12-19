import { UsersInterface } from "./IUser";
import { StoreInterface } from "./Store";

export interface BookingInterface {
    pets(pets: any): unknown;
    BookerUser: any;
    ID?: number;
    booker_user_id: number; // เชื่อมกับ UsersInterface
    store_id: number;       // เชื่อมกับ StoreInterface
    service_id: number;
    date: string;           // ISO format (required)
    booking_time: string;
    status?: string;        // Optional
    notes?: string;         // Optional
    total_cost: number;     // Required
    contact_number: string; // Required
    count_pet: number;      // Required

    User?: UsersInterface;   // ข้อมูลของผู้จอง
    Store?: StoreInterface;  // ข้อมูลร้าน
    Service?: {              // Optional Service information
        name_service: string; // Service's name (required)
        price: number;        // Service's price (required)
        duration: number;     // Service's duration (required)
    };
}
