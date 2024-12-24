import { PetInterface } from "./Pet";


export interface BookingInterface {
    pets: PetInterface[];       // รองรับเป็นอาร์เรย์ของ PetInterface
    BookerUser: any;            // ข้อมูลผู้จอง
    ID?: number;                // ID ของการจอง (ถ้ามี)
    booker_user_id: number;     // ID ของผู้จอง
    store_id: number;           // ID ของร้าน
    service_id: number;
    date: string;               // วันที่จอง (ในรูปแบบ ISO)
    booking_time: string;       // เวลาในการจอง
    status?: string;            // สถานะ (ถ้ามี)
    notes?: string;             // หมายเหตุ (ถ้ามี)
    total_cost: number;         // ค่าใช้จ่ายทั้งหมด
    contact_number: string;     // หมายเลขโทรศัพท์ของผู้จอง
    count_pet: number;          // จำนวนสัตว์เลี้ยงที่จอง

    User?: any;                 // ข้อมูลผู้ใช้ (ถ้ามี)
    Store?: any;                // ข้อมูลร้าน (ถ้ามี)
    Service?: {                 // ข้อมูลบริการ (ถ้ามี)
        name_service: string;   // ชื่อบริการ
        price: number;          // ราคา
        duration: number;       // ระยะเวลา
    };
}
