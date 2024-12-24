export interface ServiceInterface {
    ID?: number;
    store_id: number;
    store?: {
        name: string;
        location: string;
        contact_info: string;
        description: string;
        time_open: string;
        status: string;
    };
    name_service: string;
    price: number;
    duration: number; 
    category_pet: string;
}
