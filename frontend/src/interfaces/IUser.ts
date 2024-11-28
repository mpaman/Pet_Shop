export interface UsersInterface {
    ID?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string; // ควรไม่แสดงออกมา แต่สามารถใช้ภายในได้
    age?: number;
    address?: string;
    Profile?: string; // รูปแบบ Base64 หรือ URL
    role: string;
}
