import { UsersInterface } from './IUser';
export interface StoreInterface {
    user: any;
    ID?: number;
    UserownID: number;
    Userown?: UsersInterface;
    Name: string;
    Location: string;
    Phone: string;
    ContactInfo: string;
    Description: string;
    TimeOpen: string;
    Status: string; // เช่น "open", "close", "full"
}