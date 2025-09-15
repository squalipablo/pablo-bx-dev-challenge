
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';

interface LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = this.authService.validateCredentials(username, password);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      user: {
        username: user.username,
        isLoggedIn: true
      }
    };
  }
}
