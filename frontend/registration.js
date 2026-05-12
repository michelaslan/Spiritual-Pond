document.querySelector("#register").addEventListener("click", async () => {

    const username = document.querySelector("#reg-username").value;
    const email = document.querySelector("#reg-email").value;
    const password = document.querySelector("#reg-password").value;

    try {
        const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
            username,
            email,
            password
        });

        localStorage.setItem("token", response.data.jwt);
        alert("Registration successful!");
        whileLoggedIn();
        adminPanel();
    } catch (error) {
        alert("Registration failed: " + error.response.data.error.message);
    }
});

document.querySelector("#login").addEventListener("click", async () => {

    const identifier = document.querySelector("#login-username").value;
    const password = document.querySelector("#login-password").value;

    try {
        const response = await axios.post(`${BASE_URL}/api/auth/local`, {
            identifier,
            password
        });

        localStorage.setItem("token", response.data.jwt);
        alert("Login successful!");
        whileLoggedIn();
        adminPanel();
    } catch (error) {
        alert("Login failed: " + error.response.data.error.message);
    }
});

async function adminPanel(){
const BASE_URL = "http://localhost:1337";
const token = localStorage.getItem("token");
const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const user = await axios.get(`${BASE_URL}/api/users/me`, authHeader);
    if (user.data.Admin === true) {
        const adminAddBookBtn = document.querySelector("#admin-addBook");
        adminAddBookBtn.style.display = "flex";
    }
}

function whileLoggedIn () {
    const registerBtn = document.querySelector("#registerBtn");
    const loginBtn = document.querySelector("#loginBtn");
    const registerFrame = document.querySelector("#registerFrame");
    const loginFrame = document.querySelector("#loginFrame");
    const profileDuck = document.querySelector("#profileDuck");
    const token = localStorage.getItem("token");

    if (token) {
        profileDuck.style.display = "flex";
        registerBtn.style.display = "none";
        loginBtn.style.display = "none";
        registerFrame.style.display = "none";
        loginFrame.style.display = "none";
    }
    else {
        profileDuck.style.display = "none";
    }
    
}
whileLoggedIn();
adminPanel();