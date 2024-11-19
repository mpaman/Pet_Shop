export interface BookingInterface {
    id?: number;
    user_id: number;
    store_id: number;
    service_id: number;
    date: string; // ISO format
    status?: string;
    User?: {
        ID: number; // ID ของผู้ใช้
        first_name: string; // ชื่อจริงของผู้ใช้
        last_name: string;  // นามสกุลของผู้ใช้
        email: string;      // อีเมลของผู้ใช้
        Profile?: string;
    };
    store?: {
        name: string;
        location: string;
        contact_info: string;
        description: string;
        time_open: string;
        status: string;
    };
    service?: {
        name_service: string;
        price: number;
        duration: number; 
    };
}