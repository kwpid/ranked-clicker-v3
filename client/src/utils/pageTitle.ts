// Page title management utility

let originalTitle = 'Ranked Clicker';

export function setPageTitle(title: string) {
  document.title = title;
}

export function resetPageTitle() {
  document.title = originalTitle;
}

export function showMatchFoundNotification() {
  // Browser notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Ranked Clicker', {
      body: 'Match found! Get ready to compete.',
      icon: '/favicon.ico'
    });
  }
  
  // Page title notification
  setPageTitle('Match Found - Ranked Clicker');
  
  // Optional: Flash the title for attention
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    if (flashCount >= 6) {
      clearInterval(flashInterval);
      return;
    }
    
    document.title = flashCount % 2 === 0 ? '🎮 Match Found! 🎮' : 'Match Found - Ranked Clicker';
    flashCount++;
  }, 500);
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Initialize notification permission request on first load
if (typeof window !== 'undefined') {
  requestNotificationPermission();
}