import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse
} from '@/types/auth';

// Constants for localStorage keys
const USER_STORAGE_KEY = 'als_user';
const TOKEN_STORAGE_KEY = 'als_token';
const USERS_STORAGE_KEY = 'als_users';
const USER_ROLE_KEY = 'als_user_role';
const ASSIGNED_BARANGAY_KEY = 'als_assigned_barangay';

// In-memory fallback for when storage is blocked
let memoryStorage: Record<string, string> = {};

// Test user for when storage is completely blocked
const TEST_USER: User = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'master_admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Mock Authentication Service
 *
 * This service simulates API calls for authentication.
 * In a real application, these methods would make actual API requests.
 *
 * For future implementation with a real backend:
 * 1. Replace the localStorage operations with fetch/axios calls
 * 2. Update the return types to match the actual API responses
 * 3. Add proper error handling for API-specific errors
 */
class AuthService {
  /**
   * Simulates a login API call
   *
   * @param credentials User login credentials
   * @returns Promise with auth response containing user and token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate minimal API delay (100ms is more realistic for a fast API)
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real app, this would be a POST request to /api/auth/login
    const users = this.getStoredUsers();
    let user = users.find(u => u.email === credentials.email);

    // Fallback: if no users found and storage might be blocked, use test user
    if (!user && users.length === 0 && credentials.email === 'test@example.com') {
      console.warn('Using test user due to storage issues');
      user = TEST_USER;
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Note: In a real app, you would never store or compare passwords in the frontend
    // This is just for demonstration purposes
    // Accept any password that meets the minimum length requirement (8 characters)
    // This matches the validation schema in auth-validators.ts
    if (credentials.password.length < 8) {
      throw new Error('Invalid password');
    }

    // Generate a mock token
    const token = `mock-jwt-token-${Date.now()}`;

    // Optimize storage operations by batching them
    const storageType = credentials.rememberMe ? 'localStorage' : 'sessionStorage';
    const cookieMaxAge = credentials.rememberMe ? '; max-age=2592000' : ''; // 30 days if remember me

    // Store user data using safe methods
    this.safeSetItem(USER_STORAGE_KEY, JSON.stringify(user), storageType);
    this.safeSetItem(TOKEN_STORAGE_KEY, token, storageType);
    this.safeSetItem(USER_ROLE_KEY, user.role, storageType);

    if (user.assignedBarangayId) {
      this.safeSetItem(ASSIGNED_BARANGAY_KEY, user.assignedBarangayId, storageType);
    }

    // Set cookies for middleware access (must be set individually)
    document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/${cookieMaxAge}`;
    document.cookie = `${USER_ROLE_KEY}=${user.role}; path=/${cookieMaxAge}`;

    if (user.assignedBarangayId) {
      document.cookie = `${ASSIGNED_BARANGAY_KEY}=${user.assignedBarangayId}; path=/${cookieMaxAge}`;
    }

    return { user, token };
  }

  /**
   * Simulates a registration API call
   *
   * @param userData User registration data
   * @returns Promise with auth response containing user and token
   */
  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    // Simulate minimal API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real app, this would be a POST request to /api/auth/register
    const users = this.getStoredUsers();

    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already in use');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: `${userData.lastName}, ${userData.firstName} ${userData.middleName || ''}`.trim(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      gender: userData.gender,
      birthday: userData.birthday,
      role: userData.role || 'admin', // Default to regular admin if not specified
      assignedBarangayId: userData.assignedBarangayId, // Only for regular admins
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add user to stored users
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Generate a mock token
    const token = `mock-jwt-token-${Date.now()}`;

    // Store auth data using safe methods
    this.safeSetItem(USER_STORAGE_KEY, JSON.stringify(newUser), 'localStorage');
    this.safeSetItem(TOKEN_STORAGE_KEY, token, 'localStorage');
    this.safeSetItem(USER_ROLE_KEY, newUser.role, 'localStorage');
    if (newUser.assignedBarangayId) {
      this.safeSetItem(ASSIGNED_BARANGAY_KEY, newUser.assignedBarangayId, 'localStorage');
    }

    // Also set cookies for middleware access
    document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/; max-age=2592000`; // 30 days
    document.cookie = `${USER_ROLE_KEY}=${newUser.role}; path=/; max-age=2592000`;
    if (newUser.assignedBarangayId) {
      document.cookie = `${ASSIGNED_BARANGAY_KEY}=${newUser.assignedBarangayId}; path=/; max-age=2592000`;
    }

    return { user: newUser, token };
  }

  /**
   * Simulates a logout API call
   */
  async logout(): Promise<void> {
    // Simulate minimal API delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // In a real app, this might be a POST request to /api/auth/logout
    this.safeRemoveItem(USER_STORAGE_KEY);
    this.safeRemoveItem(TOKEN_STORAGE_KEY);
    this.safeRemoveItem(USER_ROLE_KEY);
    this.safeRemoveItem(ASSIGNED_BARANGAY_KEY);

    // Clear cookies
    document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${USER_ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${ASSIGNED_BARANGAY_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  /**
   * Gets the current authenticated user
   *
   * @returns The current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    try {
      // Try localStorage first, then sessionStorage
      const userJson = this.safeGetItem(USER_STORAGE_KEY);

      if (!userJson) {
        return null;
      }

      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Gets the current authentication token
   *
   * @returns The current token or null if not authenticated
   */
  getToken(): string | null {
    try {
      // Try localStorage first, then sessionStorage
      return this.safeGetItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Checks if the user is authenticated
   *
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Cache for stored users to avoid repeated parsing
  private cachedUsers: User[] | null = null;

  /**
   * Helper method to get stored users with caching for better performance
   *
   * @returns Array of stored users
   */
  getStoredUsers(): User[] {
    // Return cached users if available
    if (this.cachedUsers) {
      return this.cachedUsers;
    }

    try {
      const usersJson = this.safeGetItem(USERS_STORAGE_KEY, 'localStorage');

      if (!usersJson) {
        // Initialize with default admin users if no users exist
        const defaultUsers: User[] = [
          {
            id: 'master-admin-1',
            email: 'master@example.com',
            name: 'Master Admin',
            role: 'master_admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'admin-1',
            email: 'admin@example.com',
            name: 'Regular Admin',
            role: 'admin',
            assignedBarangayId: 'barangay-1', // Assigned to a specific barangay
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        this.safeSetItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers), 'localStorage');
        this.cachedUsers = defaultUsers;
        return defaultUsers;
      }

      const users = JSON.parse(usersJson) as User[];
      this.cachedUsers = users;
      return users;
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  }

  /**
   * Safe method to get items from storage with fallback
   * @param key Storage key
   * @param preferredStorage Preferred storage type
   * @returns Value or null if not found or error
   */
  private safeGetItem(key: string, preferredStorage?: 'localStorage' | 'sessionStorage'): string | null {
    try {
      // Try preferred storage first
      if (preferredStorage === 'localStorage') {
        return localStorage.getItem(key);
      } else if (preferredStorage === 'sessionStorage') {
        return sessionStorage.getItem(key);
      }

      // Try localStorage first, then sessionStorage
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Storage blocked for key ${key}, using memory fallback:`, error);
      // Fallback to memory storage
      return memoryStorage[key] || null;
    }
  }

  /**
   * Safe method to set items in storage with fallback
   * @param key Storage key
   * @param value Value to store
   * @param preferredStorage Preferred storage type
   */
  private safeSetItem(key: string, value: string, preferredStorage?: 'localStorage' | 'sessionStorage'): void {
    try {
      if (preferredStorage === 'localStorage') {
        localStorage.setItem(key, value);
      } else if (preferredStorage === 'sessionStorage') {
        sessionStorage.setItem(key, value);
      } else {
        // Try localStorage first, fallback to sessionStorage
        try {
          localStorage.setItem(key, value);
        } catch (localError) {
          console.warn('localStorage failed, trying sessionStorage:', localError);
          sessionStorage.setItem(key, value);
        }
      }
      // Also store in memory as backup
      memoryStorage[key] = value;
    } catch (error) {
      console.warn(`Storage blocked for key ${key}, using memory fallback:`, error);
      // Fallback to memory storage only
      memoryStorage[key] = value;
    }
  }

  /**
   * Safe method to remove items from storage
   * @param key Storage key
   */
  private safeRemoveItem(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing storage for key ${key}:`, error);
    }
    // Always remove from memory storage
    delete memoryStorage[key];
  }
}

// Export a singleton instance
export const authService = new AuthService();
