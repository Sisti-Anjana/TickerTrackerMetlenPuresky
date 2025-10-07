// Quick fix to force logout and go to login page
// You can run this in the browser console if you're stuck

// Clear all localStorage
localStorage.clear();

// Clear all sessionStorage
sessionStorage.clear();

// Reload the page to restart the app
window.location.href = '/login';
