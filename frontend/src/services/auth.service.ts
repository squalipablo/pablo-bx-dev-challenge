
export interface User {
  username: string;
  isLoggedIn: boolean;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'bonusx_auth';

  // Fake credentials for demo
  private static readonly VALID_CREDENTIALS = [
    { username: 'admin', password: 'admin123' }
  ];

  static login(username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const validUser = this.VALID_CREDENTIALS.find(
          cred => cred.username === username && cred.password === password
        );

        if (validUser) {
          const user: User = {
            username: validUser.username,
            isLoggedIn: true
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Credenziali non valide'));
        }
      }, 500);
    });
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  static isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user?.isLoggedIn || false;
  }
}
