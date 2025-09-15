
import { Injectable } from '@nestjs/common';

export interface AuthUser {
  username: string;
  isValid: boolean;
}

@Injectable()
export class AuthService {
  private static readonly VALID_CREDENTIALS = [
    { username: 'admin', password: 'admin123' }
  ];

  validateCredentials(username: string, password: string): AuthUser | null {
    const validUser = AuthService.VALID_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );

    if (validUser) {
      return {
        username: validUser.username,
        isValid: true
      };
    }

    return null;
  }

  isValidUser(username: string): boolean {
    return AuthService.VALID_CREDENTIALS.some(cred => cred.username === username);
  }
}
