// Clear authentication and force login page
console.log('🔄 Clearing authentication...');

// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Clear any auth headers
delete window.localStorage;

console.log('✅ Authentication cleared!');
console.log('📝 Please refresh the page to see the login form');

// Auto refresh after 1 second
setTimeout(() => {
  window.location.reload();
}, 1000);