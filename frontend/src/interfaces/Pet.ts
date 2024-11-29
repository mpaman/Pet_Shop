import { BookingInterface } from "./Bookingstore";
import { UsersInterface } from "./IUser";

export interface PetInterface {
    id?: number;             // ID ของสัตว์เลี้ยง (optional เพราะอาจยังไม่ได้สร้างใน backend)
    booking_id?: BookingInterface;     // ID การจองที่เชื่อมกับสัตว์เลี้ยง
    name: string;            // ชื่อสัตว์เลี้ยง
    type: string;            // ประเภทสัตว์เลี้ยง เช่น สุนัข, แมว
    breed: string;           // สายพันธุ์ของสัตว์เลี้ยง
    age: number;             // อายุสัตว์เลี้ยง (เป็นปี)
    gender: string;          // เพศของสัตว์เลี้ยง เช่น ชาย/หญิง
    weight: number;          // น้ำหนักสัตว์เลี้ยง (kg)
    color: string;           // สีของสัตว์เลี้ยง
    health_info: string;     // ข้อมูลสุขภาพ เช่น โรคประจำตัว การแพ้ยา
    vaccinated: boolean;     // สถานะการฉีดวัคซีน
    owner_id: UsersInterface;        // ID ของเจ้าของสัตว์เลี้ยง
    picture_pet?: string;    // รูปภาพของสัตว์เลี้ยง (base64 หรือ URL)
}
