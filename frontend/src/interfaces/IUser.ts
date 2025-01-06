import { RoleInterface } from "./role";
export interface UsersInterface {
    ID?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string; 
    phone?: number;
    address?: string;
    Profile?: string; 
    roleID?: RoleInterface;
}
