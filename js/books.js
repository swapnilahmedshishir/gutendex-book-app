let books = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 10;

// Fetch books from API
fetch('https://gutendex.com/books')
    .then(response => response.json())
    .then(data => {
        books = data.results;
        filteredBooks = books;  // Initially, no filtering
        paginateBooks();
        populateGenres();
    })
    .catch(error => console.error('Error fetching data:', error));

// Display books with pagination
function paginateBooks() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    displayBooks(filteredBooks.slice(start, end));

    // Disable/Enable pagination buttons based on current page
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Display books
function displayBooks(bookList) {
    const bookListElement = document.getElementById('book-list');
    bookListElement.innerHTML = '';

    if (bookList.length === 0) {
        bookListElement.innerHTML = '<p>No books found.</p>';
        return;
    }

    bookList.forEach(book => {
        const bookElement = `
            <div class="book-card">
                <img src="${book.formats['image/jpeg'] || 'placeholder.jpg'}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Author: ${book.authors[0]?.name || 'Unknown'}</p>
                <p>Genre: ${book.subjects[0] || 'Unknown'}</p>
                <button onclick="addToWishlist(${book.id})">❤️</button>
                <a href="book-detail.html?id=${book.id}">Details</a>
            </div>
        `;
        bookListElement.innerHTML += bookElement;
    });
}

// Search by title
document.getElementById('search-bar').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));
    currentPage = 1;  // Reset to the first page when searching
    paginateBooks();
});

// Populate genres dropdown
function populateGenres() {
    const genreDropdown = document.getElementById('genre-filter');
    const allGenres = [...new Set(books.flatMap(book => book.subjects))];

    allGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.innerText = genre;
        genreDropdown.appendChild(option);
    });
}

// Filter by genre
document.getElementById('genre-filter').addEventListener('change', function() {
    const selectedGenre = this.value;
    
    if (selectedGenre === "") {
        filteredBooks = books;  // Reset to all books if no genre selected
    } else {
        filteredBooks = books.filter(book => book.subjects.includes(selectedGenre));
    }

    currentPage = 1;  // Reset to the first page when filtering by genre
    paginateBooks();
});

// Pagination controls
document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        paginateBooks();
    }
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        paginateBooks();
    }
});
