import { UsersInterface } from "./IUser";

export interface StoreInterface {
    ID?: number;
    user?: UsersInterface;
    name: string;
    location: string;
    contact_info: string;
    description: string;
    time_open: string;
    status: string;
    address: string;
    time_close: string;
    services?: {
        ID: number;
        name_service: string;
        category_pet: string;
        duration: number;
        price: number;
    }[];
}
