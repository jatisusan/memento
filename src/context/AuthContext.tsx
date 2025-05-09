import { createContext, useContext, useEffect, useState } from "react";
import { IContextType, IUser } from "../types";
import { getCurrentUser } from "../lib/appwrite/api";
import { useNavigate } from "react-router-dom";

const INITIAL_USER = {
	id: "",
	name: "",
	email: "",
	username: "",
	imageUrl: "",
	bio: "",
};
const INITIAL_STATE = {
	user: INITIAL_USER,
	isLoading: false,
	isAuthenticated: false,
	setUser: () => {},
	setIsAuthenticated: () => {},
	checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<IUser>(INITIAL_USER);
	const [isLoading, setIsLoading] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const checkAuthUser = async () => {
		try {
			const currentAccount = await getCurrentUser();

			if (currentAccount) {
				setUser({
					id: currentAccount.$id,
					name: currentAccount.name,
					username: currentAccount.username,
					email: currentAccount.email,
					imageUrl: currentAccount.imageUrl,
					bio: currentAccount.bio,
				});
				setIsAuthenticated(true);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error checking auth user:", error);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const navigate = useNavigate();
	useEffect(() => {
		if (
			localStorage.getItem("cookieFallback") === "[]" ||
			localStorage.getItem("cookieFallback") === null
		) {
			navigate("/sign-in");
		}
		checkAuthUser();
	}, []);

	const value = {
		user,
		isLoading,
		setUser,
		isAuthenticated,
		setIsAuthenticated,
		checkAuthUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useUserContext = () => useContext(AuthContext);
