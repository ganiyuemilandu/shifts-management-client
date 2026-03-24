import { UserData } from "./user";


export type HTTPOkResponse<T=void> = {
	readonly data: T extends void? null: T
};

export type HTTPErrorResponse<T=void> = {
	error: T extends void? {
		readonly name: string,
		readonly message: string
	}: {
		readonly name: string,
		readonly message: string,
		readonly issues: T
	}
};

export interface SessionProps {
	readonly user: UserData | null
	readonly token: string | null
    readonly updateSession: (user: UserData | null, token?: string | null) => void
};

export type SessionData = {
	readonly user: UserData,
	readonly token: string
};

export type Pagination<T> = {
	readonly page: T[],
	readonly hasPrev: boolean,
	readonly hasNext: boolean
};

export type HTTPPaginationResponse<T> = HTTPOkResponse<Pagination<T>>;