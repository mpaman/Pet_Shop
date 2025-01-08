import { PettypeInterface } from "./Pettype";
import { StoreInterface } from "./Store";

export interface ServiceInterface {
    ID?: number;
    store_id: number;
    name_service: string;
    categorypet_id: number;
    categorypet?: PettypeInterface;
    store?: StoreInterface;
    price: number;
    duration: number;

}
