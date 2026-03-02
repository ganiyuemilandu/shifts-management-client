import type { ShiftData } from "./shift";
import type { UserData } from "./user";

export type AssignmentData = {
	staffId: number,
	shiftId: number,
	status: "accepted" | "declined" | null,
	clockedIn: string | null,
	clockedOut: string | null
	breakStart: string | null,
	breakEnd: string | null,
	declineNote: string | null
};

export interface ShiftAssignmentData extends ShiftData {
	assignment: AssignmentData;
};

export interface StaffAssignmentData extends UserData {
	assignment: AssignmentData;
};