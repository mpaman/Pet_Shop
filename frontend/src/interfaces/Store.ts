import { UsersInterface } from "./IUser";
import { ServiceareaInterface } from "./servicearea";

export interface StoreInterface {

    ID?: number;
    user?: UsersInterface;
    name: string;
    profile_image: string;

    longitude: number;
    latitude: number;
    district: string;
    province?: ServiceareaInterface;


    contact_info: string;
    description: string;
    time_open: string;
    time_close: string;
    status: string;

    services?: {
        ID: number;
        name_service: string;
        category_pet: string;
        duration: number;
        price: number;
        description: string;
    }[];
}
