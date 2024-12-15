import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const FIREBASE_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const FIREBASE_APP_ID = import.meta.env.VITE_FIREBASE_APP_ID;
const FIREBASE_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Firebase 초기화
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Service Worker 등록
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("Service Worker registered with scope:", registration.scope);
            return registration;
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    } else {
        console.error("Service Worker is not supported in this browser.");
    }
    return null;
};

/**
 * 알림 권한 요청 및 FCM 토큰 생성
 */
export const requestFCMToken = async (): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission not granted.");
            alert("알림 권한이 필요합니다. 브라우저 설정에서 알림 권한을 허용해주세요.");
            return null;
        }

        const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });
        if (token) {
            console.log("FCM Token:", token);
            return token;
        } else {
            console.warn("No FCM token available.");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving FCM token:", error);
        return null;
    }
};

/**
 * FCM 알림 수신 리스너
 */
export const onMessageListener = (): Promise<unknown> => {
    return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("Message received:", payload);
            resolve(payload);
        });
    });
};

/**
 * FCM 초기화 함수 (Service Worker 등록 → 알림 권한 요청 → FCM 토큰 요청)
 */
export const initializeFCM = async (): Promise<string | null> => {
    try {
        const registration = await registerServiceWorker();
        if (!registration) {
            throw new Error("Service Worker registration failed.");
        }
        const token = await requestFCMToken();
        return token;
    } catch (error) {
        console.error("Error initializing FCM:", error);
        return null;
    }
};
