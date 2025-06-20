const TOKEN_KEY = 'jwt_token'; // Key for storing the token in localStorage

export const saveToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('Token saved to localStorage.');
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
    // Handle cases where localStorage might be full or unavailable (e.g., in incognito mode without user permission)
  }
};


export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log(token ? 'Token retrieved from localStorage.' : 'No token found in localStorage.');
    return token;
  } catch (error) {
    console.error('Error retrieving token from localStorage:', error);
    return null;
  }
};


export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('Token removed from localStorage.');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};