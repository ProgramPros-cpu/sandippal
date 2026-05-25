import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber,
    onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 1. FIREBASE CONFIGURATION ---
// Replace the placeholder values with your actual Firebase project credentials
const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config 
    ? JSON.parse(__firebase_config) 
    : {
        apiKey: "AIzaSyB-sUgyIHCGJ3KmQzSxYnZPFRzn7tg0ctY",
        authDomain: "sandippal-portfolio.firebaseapp.com",
        projectId: "sandippal-portfolio",
        storageBucket: "sandippal-portfolio.firebasestorage.app",
        messagingSenderId: "1085349609690",
        appId: "1:1085349609690:web:3d14ea53d49324b9fde5e3",
        measurementId: "G-QFMH3G7RLS"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- 2. AUTHENTICATION UI LOGIC ---
const authOverlay = document.getElementById('authOverlay');
const msgBox = document.getElementById('authMessage');
let confirmationResult = null;

const showMessage = (msg, isError = false) => {
    msgBox.style.color = isError ? 'var(--accent)' : '#34A853';
    msgBox.innerText = msg;
};

const toggleModal = (show) => {
    if(show) {
        authOverlay.classList.add('active');
    } else {
        authOverlay.classList.remove('active');
        msgBox.innerText = '';
    }
};

// Open/Close Modal Triggers
document.getElementById('navLoginBtn').addEventListener('click', () => toggleModal(true));
document.getElementById('mobileNavLoginBtn').addEventListener('click', () => {
    document.getElementById('mobileDrawer').classList.remove('is-active');
    toggleModal(true);
});
document.getElementById('closeAuthModal').addEventListener('click', () => toggleModal(false));

// Listen for Auth State Changes (Updates Navigation UI)
onAuthStateChanged(auth, (user) => {
    const navLoginBtn = document.getElementById('navLoginBtn');
    const userNavProfile = document.getElementById('userNavProfile');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const mobileLoginBtn = document.getElementById('mobileNavLoginBtn');
    const mobileLogoutBtn = document.getElementById('mobileNavLogoutBtn');

    if (user) {
        toggleModal(false);
        navLoginBtn.style.display = 'none';
        userNavProfile.style.display = 'flex';
        mobileLoginBtn.classList.add('hidden-project');
        mobileLogoutBtn.classList.remove('hidden-project');
        // Display email or phone number in nav
        emailDisplay.innerText = user.email || user.phoneNumber || 'Authenticated Client';
    } else {
        navLoginBtn.style.display = 'block';
        userNavProfile.style.display = 'none';
        mobileLoginBtn.classList.remove('hidden-project');
        mobileLogoutBtn.classList.add('hidden-project');
    }
});

// Email & Password Auth
document.getElementById('btnEmailLogin').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;
    try {
        showMessage("Signing in...", false);
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        showMessage(error.message, true);
    }
});

document.getElementById('btnEmailSignup').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;
    try {
        showMessage("Creating account...", false);
        await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Google Auth
document.getElementById('btnGoogleLogin').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        showMessage("Redirecting to Google...", false);
        await signInWithPopup(auth, provider);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Phone Auth Setup
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'normal' });

document.getElementById('btnSendPhoneCode').addEventListener('click', async () => {
    const phoneNumber = document.getElementById('authPhone').value;
    if(!phoneNumber) return showMessage("Please enter a valid phone number", true);
    
    try {
        showMessage("Sending SMS...", false);
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        document.getElementById('phoneInputStep').style.display = 'none';
        document.getElementById('phoneVerifyStep').style.display = 'flex';
        showMessage("Code sent! Enter it below.", false);
    } catch (error) {
        showMessage(error.message, true);
    }
});

document.getElementById('btnVerifyPhoneCode').addEventListener('click', async () => {
    const code = document.getElementById('authCode').value;
    if(!code) return showMessage("Please enter the code", true);

    try {
        showMessage("Verifying...", false);
        await confirmationResult.confirm(code);
    } catch (error) {
        showMessage("Invalid code. Please try again.", true);
    }
});

// Logout Logic
const performLogout = async () => {
    try { 
        await signOut(auth); 
    } catch (error) { 
        console.error("Logout Error", error); 
    }
};

document.getElementById('navLogoutBtn').addEventListener('click', performLogout);
document.getElementById('mobileNavLogoutBtn').addEventListener('click', () => {
    performLogout();
    document.getElementById('mobileDrawer').classList.remove('is-active');
});