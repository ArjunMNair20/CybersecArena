// Run this in browser console to clear cache and test fresh sync

console.log('🔄 Clearing leaderboard cache...');
localStorage.removeItem('leaderboard_cache_v1');
console.log('✅ Cache cleared');

console.log('🔄 Clearing all leaderboard-related data...');
Object.keys(localStorage).forEach(key => {
  if (key.includes('leaderboard')) {
    localStorage.removeItem(key);
    console.log('  Removed:', key);
  }
});

console.log('✅ All cache cleared. Now refresh the page with Ctrl+R');
