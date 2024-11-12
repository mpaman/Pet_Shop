
import { StoreInterface } from './Store';


export interface ServiceInterface {
    name: any;
    ID?: number;
    store_id: number;
    store?: StoreInterface;
    name_service: string; // ชื่อของบริการ
    price: number;
    duration: number; 
}