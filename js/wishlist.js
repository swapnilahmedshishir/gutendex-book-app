// Get the wishlist from localStorage
function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

// Add/Remove book from wishlist
function addToWishlist(bookId) {
    let wishlist = getWishlist();

    // Check if the book is already in the wishlist
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
        showNotification('Removed from wishlist');
    } else {
        wishlist.push(bookId);
        showNotification('Added to wishlist');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    console.log('Updated Wishlist:', wishlist);  // Debugging: Log updated wishlist
    displayWishlist();  // Refresh the wishlist display
}

// Display wishlist books
function displayWishlist() {
    const wishlist = getWishlist();
    const bookListElement = document.getElementById('wishlist');

    console.log('Wishlist:', wishlist);  // Debugging: Log wishlist content

    // Clear the book list element
    bookListElement.innerHTML = '';

    if (wishlist.length === 0) {
        bookListElement.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    // Create the URL to fetch all wishlist books based on IDs
    const apiUrl = `https://gutendex.com/books?ids=${wishlist.join(',')}`;
    console.log('API URL:', apiUrl);  // Debugging: Log API URL

    // Fetch all wishlist books in one call
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const books = data.results || [];
            console.log('Fetched Books:', books);  // Debugging: Log fetched book data

            if (books.length === 0) {
                bookListElement.innerHTML = '<p>No books found in your wishlist.</p>';
                return;
            }

            // Generate HTML for all books and update DOM in one go
            const bookElements = books.map(book => {
                const coverImage = book.formats['image/jpeg'] || 'fallback-image.jpg';  // Provide a fallback image
                const authorName = book.authors[0]?.name || 'Unknown Author';
                const genre = book.subjects[0] || 'Unknown Genre';
                return `
                    <div class="book-card">
                        <img src="${coverImage}" alt="${book.title || 'Unknown Title'}" loading="lazy">
                        <h3>${book.title || 'Unknown Title'}</h3>
                        <p>Author: ${authorName}</p>
                        <p>Genre: ${genre}</p>
                        <button onclick="removeFromWishlist(${book.id})" class="remove-btn">Remove ❌</button>
                    </div>
                `;
            }).join('');

            bookListElement.innerHTML = bookElements;  // Insert all books at once
        })
        .catch(error => {
            bookListElement.innerHTML = '<p>Failed to load your wishlist. Please try again later.</p>';
            console.error('Error fetching wishlist books:', error);
        });
}

// Remove book from wishlist
function removeFromWishlist(bookId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();  // Refresh the display after removal
    showNotification('Removed from wishlist');
}

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: '1000', // Ensure it appears above other elements
        transition: 'opacity 0.5s ease-in-out',
    });

    // Fade out and remove notification after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500); // Remove after fade out
    }, 2000);  // Remove after 2 seconds
}

// Display wishlist when the page is loaded
document.addEventListener('DOMContentLoaded', displayWishlist);
