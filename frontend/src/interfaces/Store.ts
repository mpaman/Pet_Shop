
export interface StoreInterface {
    ID?: number;
    user_id: number; // เปลี่ยนเป็น UserID ตามที่ backend กำหนด
    User: {
        FirstName: string;
        LastName: string;
    };
    name: string;
    location: string;
    contact_info: string;
    description: string;
    time_open: string;
    status: string; // เช่น "open", "close", "full"
}
