const BASE_URL = "http://localhost:1337";
const id = new URLSearchParams(location.search).get("id");
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

const renderBook = async () => {
    const avg = await averageRating();
    const response = await axios.get(`${BASE_URL}/api/books/${id}?populate=*`);
    const book = response.data.data;
    const rating = avg[id] ?? "No ratings yet";
    const bookImgContainer = document.querySelector("#bookImg-container");
    const bookInfoContainer = document.querySelector("#bookInfo-container");
    const bookTextContainer = document.querySelector("#text-container");

    bookImgContainer.innerHTML = `
        <img src="${BASE_URL}${book.Cover?.url}"/>
    `;

    bookInfoContainer.innerHTML = `
        <h1>${book.Title}</h1>
        <h2>${book.Author}</h2>
        <br>
        <p>${book.Pages} pages</p>
        <p>Released ${book.Release}</p>
        <br>
        <p>Rating:<br><span style="color: #F59E0B;">★</span> ${rating}</p>`;
    
    if (book.Text === null){
        bookTextContainer.innerHTML = `
    <p>No text available yet</p>
    `;
    }
    else {
    bookTextContainer.innerHTML = `
    <p style="white-space: pre-wrap">${book.Text}</p>
    `;
    }
}

async function addToReadList() {
    const addToReadBtn = document.querySelector("#addToReadBtn");

    addToReadBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        const user = await axios.get(`${BASE_URL}/api/users/me`, authHeader);

        const readlistRes = await axios.get(
            `${BASE_URL}/api/readlists?filters[users_permissions_user][id][$eq]=${user.data.id}&populate=books`,
            authHeader
        );
        const readlist = readlistRes.data.data[0];

        if (readlist) {
            const existingBooks = readlist.books.map(b => b.documentId);
            await axios.put(`${BASE_URL}/api/readlists/${readlist.documentId}`, {
                data: { books: [...existingBooks, id] }
            }, authHeader);
        } else {
            await axios.post(`${BASE_URL}/api/readlists`, {
                data: { books: [id], users_permissions_user: user.data.id }
            }, authHeader);
        }
        location.reload()
    });
}

async function rateBook() {

    const user = await axios.get(`${BASE_URL}/api/users/me`, authHeader);

    const existing = await axios.get(
        `${BASE_URL}/api/user-ratings?filters[users_permissions_user][id][$eq]=${user.data.id}&filters[book][documentId][$eq]=${id}`,
        authHeader
    );
    let ratingDocumentId = existing.data.data[0]?.documentId || null;
    const existingRatingValue = existing.data.data[0]?.Rating || null;

    const stars = document.querySelectorAll("#stars span");

    if (existingRatingValue) {
        stars.forEach(s => {
            s.textContent = parseInt(s.dataset.value) <= existingRatingValue ? "★" : "☆";
            s.style.color = parseInt(s.dataset.value) <= existingRatingValue ? "gold" : "";
        });
    }

    stars.forEach(star => {
        star.addEventListener("click", async () => {
            const rating = parseInt(star.dataset.value);

            stars.forEach(s => {
                s.textContent = parseInt(s.dataset.value) <= rating ? "★" : "☆";
                s.style.color = parseInt(s.dataset.value) <= rating ? "gold" : "";
            });

            if (ratingDocumentId) {
                await axios.put(`${BASE_URL}/api/user-ratings/${ratingDocumentId}`, {
                    data: { Rating: rating }
                }, authHeader);
            } else {
                const res = await axios.post(`${BASE_URL}/api/user-ratings`, {
                    data: { Rating: rating, book: id, users_permissions_user: user.data.id }
                }, authHeader);
                ratingDocumentId = res.data.data.documentId;
            }
        });
    });
}

async function checkReadlistStatus() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const user = await axios.get(`${BASE_URL}/api/users/me`, authHeader);
    const readlistRes = await axios.get(
        `${BASE_URL}/api/readlists?filters[users_permissions_user][id][$eq]=${user.data.id}&populate=books`,
        authHeader
    );
    const readlist = readlistRes.data.data[0];
    const addToReadBtn = document.querySelector("#addToReadBtn");

    if (readlist?.books.some(b => b.documentId === id)) {
        addToReadBtn.style.backgroundColor = "#e74c3c";
        addToReadBtn.style.color = "#fff";
    }
}

async function Theme() {
    const theme = await axios.get(`${BASE_URL}/api/theme`);
    const res = theme.data.data?.Color;
    if (res === null) {
        document.body.classList.add("red-theme");
    } else if (res === false) {
        document.body.classList.add("dark-theme");
    }
}

renderBook();
addToReadList();
rateBook();
checkReadlistStatus();
Theme();

