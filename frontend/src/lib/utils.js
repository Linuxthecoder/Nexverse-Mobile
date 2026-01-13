export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function collectDeviceMetadata() {
  // Collect only essential, non-invasive metadata
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const userAgent = navigator.userAgent;
  
  // Basic screen info (less invasive than exact resolution)
  const screenInfo = {
    width: window.screen.width > 1920 ? 'large' : window.screen.width > 1366 ? 'medium' : 'small',
    colorDepth: window.screen.colorDepth
  };

  return {
    timezone,
    language,
    userAgent,
    screenInfo,
    timestamp: new Date().toISOString(),
  };
}

export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Last seen never";
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInSeconds = Math.floor((now - lastSeenDate) / 1000);
  
  if (diffInSeconds < 60) {
    return "Last seen just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Last seen ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Last seen yesterday";
  }
  if (diffInDays < 7) {
    return `Last seen ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  // For longer periods, show the date
  return `Last seen on ${lastSeenDate.toLocaleDateString()}`;
};

export const formatMessageStatus = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);
  
  if (diffInSeconds < 60) {
    return "seen just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `seen ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `seen ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "seen yesterday";
  }
  if (diffInDays < 7) {
    return `seen ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `seen ${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `seen ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  // For longer periods, show the date
  return `seen on ${messageDate.toLocaleDateString()}`;
};

export const formatLastSeenWithTime = (lastSeen) => {
  if (!lastSeen) return "Never";
  
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffInHours = Math.floor((now - lastSeenDate) / (1000 * 60 * 60));
  
  // Format time in 12-hour format with AM/PM
  const timeString = lastSeenDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  
  // If today, just show time
  if (diffInHours < 24 && lastSeenDate.getDate() === now.getDate()) {
    return `Last seen at ${timeString}`;
  }
  
  // If yesterday
  if (diffInHours < 48 && lastSeenDate.getDate() === now.getDate() - 1) {
    return `Last seen yesterday at ${timeString}`;
  }
  
  // Otherwise show date and time
  const dateString = lastSeenDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Last seen ${dateString} at ${timeString}`;
};
