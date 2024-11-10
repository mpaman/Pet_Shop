import { UsersInterface } from './IUser';
import { StoreInterface } from './Store';
import { ServiceInterface } from './Service';

export interface BookingstoreInterface {
    ID?: number;
    BookerUserID: number;
    BookerUser?: UsersInterface;
    StoreID: number;
    Store?: StoreInterface;
    ServiceID: number;
    Service?: ServiceInterface;
    Datebooking: string; // ใช้ string แทน Date เพื่อให้ง่ายต่อการแปลงรูปแบบวันที่
    Timebooking: string; // ใช้ string แทน Date สำหรับเวลา
    Status: string; // "pending", "accepted"
}