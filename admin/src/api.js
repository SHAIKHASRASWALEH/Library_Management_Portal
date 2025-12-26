import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL_2,
    withCredentials: true, // Ensures cookies & tokens are sent
});

export default API;
