import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return { message: "I'm Mr. Meeseeks, look at me!" };
  }
}
