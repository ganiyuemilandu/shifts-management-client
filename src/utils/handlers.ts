import type { AxiosError } from "axios";
import type { HTTPErrorResponse, HTTPOkResponse, SessionData } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import { axiosClient, includeToken, toast } from "@/utils";


export const logoutUser = async () => {
	try {
		await axiosClient.get("/auth/logout");
		toast.success("You've been successfully logged out");
		return true;
	} catch (error) {
		handleRequestError(error);
		return false;
	}
	};


export const deleteUser = async (id: number, token: string) => {
	try {
		await axiosClient.delete("/users/" + id, includeToken(token));
		toast.success("Successfully deleted user");
		return true;
	} catch (error) {
		handleRequestError(error);
		return false;
	}
};


export const handleRequestError = (err: unknown) => {
	if (err instanceof Error) {
		const { response } = err as AxiosError;
		if (response) {  // Response from server
			const { data } = response;
			const { error: { message } } = data as HTTPErrorResponse;
			toast.error(message);
		}
		else  // No response from server
			toast.error("Couldn't connect to server. Try again later.");
		}
		else
			toast.error("An unexpected error occured.");
};


export const refreshSession = async (): Promise<SessionData | null> => {
	try {
		const { data } = await axiosClient.get<HTTPOkResponse<SessionData>>("/auth/refresh-token");
		return data.data;
	} catch (_error) {
		return null;
	}
};


export const deleteShift = async (shift: ShiftData, token: string) => {
	try {
		await axiosClient.delete(`/shifts/${shift.id}`, includeToken(token));
		toast.success("Successfully deleted shift");
		return true;
	} catch (error) {
		handleRequestError(error);
		return false;
	}
};