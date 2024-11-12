import { StoreInterface } from './Store';

export interface StoreImageInterface {
    url: any;
    response: any;
    ID?: number;
    image_url: string;
    store_id: number;
    store?: StoreInterface;
}