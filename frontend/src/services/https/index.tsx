import axios from "axios";
import { UsersInterface } from "../../interfaces/IUser";
import { SignInInterface } from "../../interfaces/SignIn";
import { BookingInterface } from '../../interfaces/Bookingstore';
import { ServiceInterface } from '../../interfaces/Service';
import { StoreInterface } from '../../interfaces/Store';
import { StoreImageInterface } from '../../interfaces/Storeimage';
import { PetInterface } from "../../interfaces/Pet";
const apiUrl = "http://localhost:8000";
const token = localStorage.getItem("token");
const tokenType = localStorage.getItem("token_type");

const requestOptions = {
    headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenType} ${token}`,
    },
};

// Authentication
async function SignIn(data: SignInInterface) {
    return await axios.post(`${apiUrl}/signin`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

// Users
async function GetUsers() {
    return await axios.get(`${apiUrl}/users`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function GetUsersById(id: string) {
    return await axios.get(`${apiUrl}/user/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function UpdateUsersById(id: string, data: UsersInterface) {
    return await axios.put(`${apiUrl}/user/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function DeleteUsersById(id: string) {
    return await axios.delete(`${apiUrl}/user/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function CreateUser(data: UsersInterface) {
    return await axios.post(`${apiUrl}/signup`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

// Store API calls
async function GetAllStores() {
    return await axios.get(`${apiUrl}/stores`, requestOptions)
        .then((res) => res)
        .catch((e) => e.response);
}


async function DeleteStoreById(id: string) {
    return await axios.delete(`${apiUrl}/store/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}


async function DeleteService(id: string) {
    return await axios.delete(`${apiUrl}/service/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function DeleteStoreImage(id: string) {
    return await axios.delete(`${apiUrl}/storeimage/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}


export const GetUserProfile = async (): Promise<any> => {
    if (!token) throw new Error("No token found");

    try {
        const response = await fetch(`${apiUrl}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch user profile");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};


async function CreateStore(data: StoreInterface) {
    return await axios.post(`${apiUrl}/store`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function CreateService(data: ServiceInterface) {
    return await axios.post(`${apiUrl}/service`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function CreateStoreImage(data: StoreImageInterface) {
    return await axios.post(`${apiUrl}/storeimage`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}


async function UpdateStore(id: string, data: StoreInterface) {
    return await axios.put(`${apiUrl}/store/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function UpdateService(id: string, data: ServiceInterface) {
    return await axios.put(`${apiUrl}/service/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}


async function GetStoreImages(id: string) {
    return await axios.get(`${apiUrl}/storeimages/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function GetServiceByStoreID(id: string) {
    return await axios.get(`${apiUrl}/service/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function GetStoreByID(id: string) {
    return await axios.get(`${apiUrl}/store/${id}`, requestOptions)
        .then((res) => res)
        .catch((e) => e.response);
}


async function GetAllService() {
    return await axios.get(`${apiUrl}/services`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}


async function GetAllStoreImage() {
    return await axios.get(`${apiUrl}/storeimagess`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}



async function CreateBooking(data: BookingInterface) {
    return await axios.post(`${apiUrl}/booking`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function GetBookingstoreByStoreID(id: string) {
    return await axios.get(`${apiUrl}/bookingstore/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function GetAllBookings() {
    return await axios.get(`${apiUrl}/bookingstores`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function UpdateBookingStatus(id: string, data: BookingInterface) {
    return await axios.put(`${apiUrl}/bookingstore/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function DeleteBooking(id: string) {
    return await axios.delete(`${apiUrl}/bookingstore/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function UpdateStoreStatus(id: string, data: BookingInterface) {
    return await axios.put(`${apiUrl}/store/${id}/status`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
//pet
async function CreatePet(data: PetInterface) {
    return await axios.post(`${apiUrl}/pet`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function UpdatePet(id: string, data: PetInterface) {
    return await axios.put(`${apiUrl}/pet/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function DeletePet(id: string) {
    return await axios.delete(`${apiUrl}/pet/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
async function GetAllPets() {
    return await axios.get(`${apiUrl}/pets`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}
// Export all functions
export {
    SignIn,
    GetUsers,
    GetUsersById,
    UpdateUsersById,
    DeleteUsersById,
    CreateUser,


    CreatePet,UpdatePet,DeletePet,GetAllPets,
    CreateStore, UpdateStore, DeleteStoreById, GetAllStores, GetStoreByID,
    CreateService, DeleteService, UpdateService, GetAllService, GetServiceByStoreID,
    CreateStoreImage, DeleteStoreImage, GetStoreImages, GetAllStoreImage,UpdateStoreStatus,
    CreateBooking, GetAllBookings, GetBookingstoreByStoreID, UpdateBookingStatus, DeleteBooking
};
