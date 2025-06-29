import { BookingInterface } from "./Bookingstore";

export interface PetInterface {
    ID?: number;             // ID ของสัตว์เลี้ยง (optional เพราะอาจยังไม่ได้สร้างใน backend)
    booking_id?: BookingInterface;     // ID การจองที่เชื่อมกับสัตว์เลี้ยง

    name: string;            // ชื่อสัตว์เลี้ยง
    breed: string;           // สายพันธุ์ของสัตว์เลี้ยง
    age: number;             // อายุสัตว์เลี้ยง (เป็นปี)
    gender: string;          // เพศของสัตว์เลี้ยง เช่น ชาย/หญิง
    weight: number;          // น้ำหนักสัตว์เลี้ยง (kg)
    vaccinated: string;     // สถานะการฉีดวัคซีน

    owner_id: number;        // ID ของเจ้าของสัตว์เลี้ยง
    picture_pet?: string;    
}
