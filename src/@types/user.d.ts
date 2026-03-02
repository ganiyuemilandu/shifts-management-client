export default interface IUser {
	id: number;
	firstName: string;
	lastName: string;
	role: "admin" | "staff";
	email: string;
	password: string;
	createdAt: string;
	updatedAt: string;
};


export type UserFields = Omit<IUser, "id" | "createdAt" | "updatedAt">;

export type UserData = Readonly<Omit<IUser, "password">>;

export type UserCredentials = Readonly<Pick<IUser, "email" | "password">>;

export interface UserProps {
	user: UserData | null;
	updateUser: (user: UserData | null) => void;
};