import type { AxiosError } from "axios";
import { formatDistanceToNow } from "date-fns";
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
			const { data, status } = response;
			if (status === 429) {
				const secondsLeft = response.headers["retry-after"];
				const millisLeft = secondsLeft ? parseInt(secondsLeft, 10) * 1000 : 0;
				const waitTime = millisLeft && formatDistanceToNow(new Date(Date.now() + millisLeft), { addSuffix: true });
				const message = `Too many requests. Please try again ${waitTime || "later"}.`;
				toast.error(message);
				return;
			}
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