import { createContext, useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

import type { SessionData, SessionProps } from "@/@types";
import { refreshSession } from "@/utils/handlers";
import { toast } from "@/utils";


const SessionContext = createContext<SessionProps | null>(null);

const SessionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const session = useLoaderData() as SessionData | null;
	const [user, setUser] = useState<SessionProps["user"]>(session && session.user);
	const [token, setToken] = useState<SessionProps["token"]>(session && session.token);

	const updateSession: SessionProps["updateSession"] = (user, token) => {
		setUser(user);
		if (!user)
			setToken(null);
		else if (token !== undefined)
			setToken(token);
	};

	const refreshToken = async () => {
		const session= await refreshSession();
		if (session) {
			const { token, user } = session;
			updateSession(user, token);
		}
		else {
			if (user) {
				toast.error("An unexpected error occurred. Please try log in again or refresh the page.");
				updateSession(null);
			}
		}
	};

	useEffect(() => {
		if (!token)
			return;
		const delay = 14 * 60 * 1000; // 14 minutes
		const timeout = setTimeout(() => refreshToken(), delay);
		return () => clearTimeout(timeout);
	}, [token]);

	return (
		<SessionContext.Provider value={{ user, token, updateSession }}>
			{children}
		</SessionContext.Provider>
	);
};


export const useSession = (): SessionProps => {
	const context = useContext(SessionContext);
	if (!context)
		throw new Error("useSession may only be used within SessionProvider");
	return context;
};

export default SessionProvider;