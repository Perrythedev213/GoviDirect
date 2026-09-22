(function () {
    "use strict";

    const DEMO_ACCOUNTS = [
        {
            username: "buyer",
            password: "buyer123",
            name: "Demo Buyer",
            accountType: "buyer",
            role: "general"
        },
        {
            username: "seller",
            password: "seller123",
            name: "Demo Seller",
            accountType: "seller",
            role: "general"
        },
        {
            username: "admin",
            password: "admin123",
            name: "Demo Admin",
            accountType: "admin",
            role: "admin"
        }
    ];

    const SESSION_KEY = "goviDirectSession";


    function getCurrentUser() {
        try {
            const session = localStorage.getItem(SESSION_KEY);

            if (!session) {
                return null;
            }

            return JSON.parse(session);
        } catch (error) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
    }


    function saveSession(account) {
        const session = {
            username: account.username,
            name: account.name,
            accountType: account.accountType,
            role: account.role
        };

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );
    }


    function isLoggedIn() {
        return getCurrentUser() !== null;
    }


    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }


    function isAdmin() {
        const user = getCurrentUser();

        return user && user.role === "admin";
    }


    window.GoviDirectAuth = {
        getCurrentUser,
        saveSession,
        isLoggedIn,
        logout,
        isAdmin,
        DEMO_ACCOUNTS
    };


    const loginModeBtn = document.getElementById("loginModeBtn");
    const signupModeBtn = document.getElementById("signupModeBtn");

    const modeSlider = document.getElementById("modeSlider");

    const loginView = document.getElementById("loginView");
    const signupView = document.getElementById("signupView");

    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");


    function showLogin() {
        modeSlider.classList.remove("signup");

        loginModeBtn.classList.add("active");
        signupModeBtn.classList.remove("active");

        signupView.classList.remove("active");

        setTimeout(() => {
            loginView.classList.remove("exit-left");
            loginView.classList.add("active");
        }, 80);
    }


    function showSignup() {
        modeSlider.classList.add("signup");

        signupModeBtn.classList.add("active");
        loginModeBtn.classList.remove("active");

        loginView.classList.remove("active");
        loginView.classList.add("exit-left");

        setTimeout(() => {
            signupView.classList.add("active");
        }, 80);
    }


    loginModeBtn.addEventListener("click", showLogin);
    signupModeBtn.addEventListener("click", showSignup);


    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        loginError.textContent = "";


        const account = DEMO_ACCOUNTS.find(function (demoAccount) {
            return (
                demoAccount.username.toLowerCase() === username.toLowerCase() &&
                demoAccount.password === password
            );
        });


        if (!account) {
            loginError.textContent =
                "Incorrect username or password.";

            return;
        }


        saveSession(account);


        const button = loginForm.querySelector(".login-button");

        button.textContent = "Logging in...";
        button.disabled = true;


        setTimeout(function () {

            /*
             * Change this path if your main app/home page
             * uses a different location.
             */
            window.location.href = "../Discover/index.html";

        }, 450);
    });


    /*
     * If someone is already logged in and somehow reaches
     * the login page again, send them back into the app.
     */
    if (isLoggedIn()) {
        window.location.href = "../Discover/index.html";
    }

})();