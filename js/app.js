let books = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 10;

// Fetch books from API
async function fetchBooks() {
  try {
    const response = await fetch("https://gutendex.com/books");
    const data = await response.json();
    books = data.results;
    filteredBooks = books; // Initially, no filtering
    paginateBooks();
    populateGenres();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Display books with pagination
function paginateBooks() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  displayBooks(filteredBooks.slice(start, end));

  // Disable/Enable pagination buttons based on current page
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Display books
function displayBooks(bookList) {
  const bookListElement = document.getElementById("book-list");
  bookListElement.innerHTML = "";

  if (bookList.length === 0) {
    bookListElement.innerHTML = "<p>No books found.</p>";
    return;
  }

  bookList.forEach((book) => {
    const bookElement = `
            <div class="book-card">
                <img src="${
                  book.formats["image/jpeg"] || "placeholder.jpg"
                }" alt="${book.title}" loading="lazy">
                <h3>${book.title}</h3>
                <p>Author: ${book.authors[0]?.name || "Unknown"}</p>
                <p>Genre: ${book.subjects[0] || "Unknown"}</p>
                <button onclick="addToWishlist(${book.id})">❤️</button>
                <a href="book-detail.html?id=${book.id}">Details</a>
            </div>
        `;
    bookListElement.innerHTML += bookElement;
  });
}

// Search by title
document.getElementById("search-bar").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(query)
  );
  currentPage = 1; // Reset to the first page when searching
  paginateBooks();
});

// Populate genres dropdown
function populateGenres() {
  const genreDropdown = document.getElementById("genre-filter");
  const allGenres = [...new Set(books.flatMap((book) => book.subjects))];

  genreDropdown.innerHTML = '<option value="">Select a genre</option>'; // Default option

  allGenres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.innerText = genre;
    genreDropdown.appendChild(option);
  });
}

// Filter by genre
document.getElementById("genre-filter").addEventListener("change", function () {
  const selectedGenre = this.value;

  filteredBooks =
    selectedGenre === ""
      ? books // Reset to all books if no genre selected
      : books.filter((book) => book.subjects.includes(selectedGenre));

  currentPage = 1; // Reset to the first page when filtering by genre
  paginateBooks();
});

// Pagination controls
document.getElementById("next-page").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    paginateBooks();
  }
});

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    paginateBooks();
  }
});

// Load book details based on the book ID in the URL
async function loadBookDetails() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    document.getElementById("book-details").innerHTML =
      "<p>Book not found.</p>";
    return;
  }

  try {
    const response = await fetch(`https://gutendex.com/books/${bookId}`);
    const book = await response.json();

    document.getElementById("book-title").innerText =
      book.title || "Unknown Title";
    document.getElementById("book-author").innerText = `Author: ${
      book.authors[0]?.name || "Unknown"
    }`;
    document.getElementById("book-genre").innerText = `Genre: ${
      book.subjects[0] || "Unknown"
    }`;
    document.getElementById("book-cover").src =
      book.formats["image/jpeg"] || "placeholder.jpg";
    document.getElementById("book-description").innerText = `Description: ${
      book.description || "No description available."
    }`;
  } catch (error) {
    console.error("Error fetching book details:", error);
    document.getElementById("book-details").innerHTML =
      "<p>Error loading book details.</p>";
  }
}

// Initial fetch when the page loads
document.addEventListener("DOMContentLoaded", fetchBooks);
