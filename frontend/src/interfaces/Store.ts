export interface StoreInterface {
    services: any;
    ID?: number;
    user?: {
        ID: number;
        first_name: string;
        last_name: string;
        email: string;
        Profile?: string; // รูปแบบ Base64
    };
    name: string;
    location: string;
    contact_info: string;
    description: string;
    time_open: string;
    status: string;
}
