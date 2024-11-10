import { StoreInterface } from './Store';

export interface StoreImageInterface {
    ID?: number;
    ImageUrl: string;
    StoreID: number;
    Store?: StoreInterface;
}