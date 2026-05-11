const BASE_URL = "http://localhost:1337";

async function createBook() {
    const title = document.querySelector("#addBook-title").value;
    const author = document.querySelector("#addBook-author").value;
    const pages = document.querySelector("#addBook-pages").value;
    const release = document.querySelector("#addBook-release").value;
    const image = document.querySelector("#addBook-image").files;
    const text = document.querySelector("#addBook-text").value;

    let imgData = new FormData();
    imgData.append("files", image[0]);

    try {
        const uploadRes = await axios.post(`${BASE_URL}/api/upload`, imgData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const imageId = uploadRes.data[0].id;

        await axios.post(`${BASE_URL}/api/books`, {
            data: {
                Title: title,
                Author: author,
                Pages: pages,
                Release: release,
                Cover: imageId,
                Text: text
            }
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        alert("Book created!");
    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
}
