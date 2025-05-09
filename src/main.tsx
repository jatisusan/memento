import { createRoot } from "react-dom/client";
import "./globals.css";
import App from "./App.tsx";

import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext.tsx";
import { QueryProvider } from "./lib/react-query/QueryProvider.tsx";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<QueryProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</QueryProvider>
	</BrowserRouter>
);
