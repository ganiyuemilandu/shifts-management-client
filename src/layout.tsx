import { Toaster } from "react-hot-toast";
import { Outlet, useNavigation } from "react-router-dom";

import Navbar from "@components/accessories/navbar";
import SessionProvider from "@/components/accessories/session";
import { ProgressBar, ProgressRoot } from "@components/ui/progress";
import { Provider as ChakraProvider } from "@components/ui/provider";


const RootLayout: React.FC = () => {
	const navigation = useNavigation();

	return (
		<SessionProvider>
			<ChakraProvider>
				{navigation.state === "loading" ? (
					<ProgressRoot value={null}>
						<ProgressBar />
					</ProgressRoot>
				) : (
					<>
						<Toaster position="bottom-right" />
						<Navbar />
						<Outlet />
					</>
				)}
			</ChakraProvider>
		</SessionProvider>
	);
};

export default RootLayout;