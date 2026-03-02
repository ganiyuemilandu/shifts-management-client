import axios, { type AxiosRequestConfig } from "axios";
import reactHotToast from "react-hot-toast";


const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:3000/api/v1";

export const axiosClient = axios.create({
	baseURL: BASE_URL,
	withCredentials: true
});

/*
axiosClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const { config, response } = error;
		if (response?.status === 401 && !config?._retry) {
			config._retry = true;
			try {
				await axios.get(BASE_URL + "/auth/refresh-token", { withCredentials: true });
				return axiosClient(config);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
*/


export const includeToken = (token: string): AxiosRequestConfig => ({
	headers: {
		Authorization: `Bearer ${token}`
	},
});


export const toast = {
	error: (message: string) => {
		reactHotToast.error(message, {
			ariaProps: {
				"role": "alert",
				"aria-live": "assertive"
			}
		});
	},

	success: (message: string) => {
		reactHotToast.success(message, {
			ariaProps: {
				"role": "alert",
				"aria-live": "assertive"
			}
		});
	}
};