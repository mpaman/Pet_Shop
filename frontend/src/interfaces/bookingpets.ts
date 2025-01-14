import { BookingInterface } from "./Bookingstore";
// import { PetInterface } from "./Pet";

export interface BookingPetsInterface {
    ID?: number;         
    booking_id?: BookingInterface;    
    pet_id?: number;
    // pet_id?: PetInterface;
}
