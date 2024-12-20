import { UsersInterface } from "./IUser";

export interface PetStoreApplicationInterface {
    id?: number;               // ID ของคำขอ (optional)
    user_id: UsersInterface;

    store_name: string;        // ชื่อร้าน
    Email: string; 
    phone : string; 
    location : string; 
    license_document_url: string; // URL ของเอกสารใบอนุญาต
    status: string;            // สถานะของคำขอ เช่น "pending", "approved", "rejected"
}
