import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import mainRouter from "./routers/mainRouter.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { initializeFCM } from "./config/firebase-config";
import NotificationPopup from "./components/personalcolor/NotificationPopup";

const queryClient = new QueryClient();

initializeFCM(); // FCM 초기화 실행

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={mainRouter} />
        <NotificationPopup />
    </QueryClientProvider>
);
