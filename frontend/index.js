const BASE_URL = "http://localhost:1337";
const token = localStorage.getItem("token");
const authHeader = { headers: { Authorization: `Bearer ${token}` } };

async function averageRating() {
    const res = await axios.get(`${BASE_URL}/api/user-ratings?populate=book`);
    const ratings = res.data.data;
    const map = {};
    ratings.forEach(r => {
        const id = r.book?.documentId;
        if (!id) return;
        if (!map[id]) map[id] = [];
        map[id].push(r.Rating);
    });
    const avg = {};
    for (const id in map) {
        avg[id] = (map[id].reduce((a, b) => a + b, 0) / map[id].length).toFixed(1);
    }
    return avg;
}

const renderPage = async () => {
    const avg = await averageRating();
    let response = await axios.get(`${BASE_URL}/api/books?populate=*`);
    let books = response.data.data;

    books.forEach(book => {
        console.log(book.Cover);
        const rating = avg[book.documentId] ?? "No rating yet";
        const card = document.createElement("div");
        card.className = "book-container";
        card.innerHTML = `
            <img src="${BASE_URL}${book.Cover?.url}"/>
            <h2>${book.Title}</h2>
            <p>${book.Author}</p>
            <p>${book.Pages} pages</p>
            <p>Released ${book.Release}</p>
            <p><span style="color: #F59E0B;">★</span> ${rating}</p>`
            ;
            
        card.addEventListener("click", () => {
            window.location.href = `book.html?id=${book.documentId}`;
        });
        document.querySelector("#book-list").appendChild(card);
    })
}

function buttonRendering (){
    const registerBtn = document.querySelector("#registerBtn");
    const loginBtn = document.querySelector("#loginBtn");
    const registerFrame = document.querySelector("#registerFrame");
    const loginFrame = document.querySelector("#loginFrame");
    const closeRegisterBtn = document.querySelector("#closeRegisterBtn");
    const closeLoginBtn = document.querySelector("#closeLoginBtn");

    const openRegisterFrame = () => {
        loginFrame.style.display = "none";
        registerFrame.style.display = "flex";
    }

    const openLoginFrame = () => {
        registerFrame.style.display = "none";
        loginFrame.style.display = "flex";
    }

    const closeRegisterFrame = () => {
        registerFrame.style.display = "none";
    }

    const closeLoginFrame = () => {
        loginFrame.style.display = "none";
    }

    registerBtn.addEventListener("click", openRegisterFrame);
    loginBtn.addEventListener("click", openLoginFrame);
    closeRegisterBtn.addEventListener("click", closeRegisterFrame);
    closeLoginBtn.addEventListener("click", closeLoginFrame);
}

async function Theme(){
    const theme = await axios.get(`${BASE_URL}/api/theme`);
    const res = theme.data.data?.Color;
    if (res === null){
        document.body.classList.add("red-theme");
    } else if (res === false){
        document.body.classList.add("dark-theme");
    }
}

buttonRendering();
renderPage();
Theme();