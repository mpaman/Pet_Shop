
export interface StoreImageInterface {

    ID?: number;
    image_url: string;
    store_id: number;
    store?: {
        name: string;
        location: string;
        contact_info: string;
        description: string;
        time_open: string;
        status: string;
    };
}