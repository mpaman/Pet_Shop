import axios from "axios";
import { UsersInterface } from "../../interfaces/IUser";
import { SignInInterface } from "../../interfaces/SignIn";
import { BookingstoreInterface } from '../../interfaces/Bookingstore';
import { ServiceInterface } from '../../interfaces/Service';
import { StoreInterface } from '../../interfaces/Store';
import { StoreImageInterface } from '../../interfaces/Storeimage';

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
    return await axios.get(`${apiUrl}/stores`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function GetStoreById(id: string) {
    return await axios.get(`${apiUrl}/store/${id}`, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function UpdateStoreById(id: string, data: StoreInterface) {
    return await axios.put(`${apiUrl}/store/${id}`, data, { headers: requestOptions.headers })
        .then((res) => res)
        .catch((e) => e.response);
}

async function DeleteStoreById(id: string) {
    return await axios.delete(`${apiUrl}/store/${id}`, { headers: requestOptions.headers })
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



export const GetStoreImages = async (storeId: string) => {
    return await axios.get(`${apiUrl}/storeimages?storeId=${storeId}`, requestOptions);
};


export const GetStoreServices = async (storeId: string) => {
    return await axios.get(`${apiUrl}/service/${storeId}`, requestOptions);
};


// Export all functions
export {
    SignIn,
    GetUsers,
    GetUsersById,
    UpdateUsersById,
    DeleteUsersById,
    CreateUser,
    GetAllStores,
    GetStoreById,
    UpdateStoreById,
    DeleteStoreById,
    CreateStore,
    CreateService,
    CreateStoreImage
};