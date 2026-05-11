const BASE_URL = "http://localhost:1337";
const token = localStorage.getItem("token");
const authHeader = { headers: { Authorization: `Bearer ${token}` } };

let readlistBooks = [];
let ratedEntries = [];
let readlistDocumentId = null;

const renderProfile = async () => {
    if (!token) return;

    const user = await axios.get(`${BASE_URL}/api/users/me`, authHeader);
    document.querySelector("#profile-username").textContent = user.data.username;

    const readlistRes = await axios.get(
        `${BASE_URL}/api/readlists?filters[users_permissions_user][id][$eq]=${user.data.id}&populate=books.Cover`,
        authHeader
    );
    const readlist = readlistRes.data.data[0];
    readlistDocumentId = readlist?.documentId || null;
    readlistBooks = readlist?.books || [];
    showReadlist(readlistBooks);

    const ratingsRes = await axios.get(
        `${BASE_URL}/api/user-ratings?filters[users_permissions_user][id][$eq]=${user.data.id}&populate=book.Cover`,
        authHeader
    );
    ratedEntries = ratingsRes.data.data;
    showRated(ratedEntries);
}

const showReadlist = (books) => {
    const container = document.querySelector("#readlist-container");
    container.innerHTML = books.length === 0 ? "<p>Din läslista är tom.</p>" : "";

    books.forEach(book => {
        container.innerHTML += `
            <div class="profile-book" onclick="window.location.href='book.html?id=${book.documentId}'">
                <img src="${BASE_URL}${book.Cover?.url}" class="profile-book-img"/>
                <div class="profile-book-info">
                    <strong>${book.Title}</strong>
                    <span>${book.Author}</span>
                </div>
                <button class="delete-btn" onclick="deleteBook(event, '${book.documentId}')">🗑</button>
            </div>`;
    });
}

async function deleteBook(e, bookDocumentId) {
    e.stopPropagation();
    readlistBooks = readlistBooks.filter(b => b.documentId !== bookDocumentId);
    await axios.put(`${BASE_URL}/api/readlists/${readlistDocumentId}`, {
        data: { books: readlistBooks.map(b => b.documentId) }
    }, authHeader);
    showReadlist(readlistBooks);
}

const showRated = (entries) => {
    const container = document.querySelector("#rated-container");
    container.innerHTML = entries.length === 0 ? "<p>Du har inte betygsatt några böcker än.</p>" : "";
    entries.forEach(entry => {
        const book = entry.book;
        if (!book) return;
        container.innerHTML += `
            <div class="profile-book" onclick="window.location.href='book.html?id=${book.documentId}'">
                <img src="${BASE_URL}${book.Cover?.url}" class="profile-book-img"/>
                <div class="profile-book-info">
                    <strong>${book.Title}</strong>
                    <span>${book.Author}</span>
                </div>
                <div class="profile-book-rating">★ ${entry.Rating}</div>
            </div>`;
    });
}


document.querySelector("#read-authorFilter").addEventListener("click", () =>
    showReadlist([...readlistBooks].sort((a, b) => a.Author.localeCompare(b.Author)))
);
document.querySelector("#read-titleFilter").addEventListener("click", () =>
    showReadlist([...readlistBooks].sort((a, b) => a.Title.localeCompare(b.Title)))
);
document.querySelector("#rate-authorFilter").addEventListener("click", () =>
    showRated([...ratedEntries].sort((a, b) => a.book.Author.localeCompare(b.book.Author)))
);
document.querySelector("#rate-titleFilter").addEventListener("click", () =>
    showRated([...ratedEntries].sort((a, b) => a.book.Title.localeCompare(b.book.Title)))
);
document.querySelector("#rate-ratingFilter").addEventListener("click", () =>
    showRated([...ratedEntries].sort((a, b) => b.Rating - a.Rating))
);

document.querySelector("#logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});

async function Theme() {
    const theme = await axios.get(`${BASE_URL}/api/theme`);
    const res = theme.data.data?.Color;
    if (res === null) {
        document.body.classList.add("red-theme");
    } else if (res === false) {
        document.body.classList.add("dark-theme");
    }
}

renderProfile();
Theme();
