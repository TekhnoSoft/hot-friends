import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

const Api = {
    auth: async () => {
        return await axios.get(`${API_BASE}/users/auth`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    get: async () => {
        return await axios.get(`${API_BASE}/users/get`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE}/users/login`, { email, password });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },
    register: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/users/register`, data);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },
    googleLogin: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/users/google`, data);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    }
}

export default Api;