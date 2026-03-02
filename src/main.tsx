import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";


const rootElement = document.getElementById("root");

createRoot(rootElement!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);