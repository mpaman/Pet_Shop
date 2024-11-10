
import { StoreInterface } from './Store';


export interface ServiceInterface {
    ID?: number;
    StoreID: number;
    Store?: StoreInterface;
    Nameservice: string; // ชื่อของบริการที่ให้เลือก
    Price: string;
}