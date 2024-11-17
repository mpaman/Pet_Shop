
import { StoreInterface } from './Store';


export interface ServiceInterface {
    ID?: number;
    store_id: number;
    store?: StoreInterface;
    name_service: string; // ชื่อของบริการ
    price: number;
    duration: number; 
    category_pet: string;
}