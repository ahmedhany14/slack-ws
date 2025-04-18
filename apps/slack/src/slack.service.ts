import { Injectable } from '@nestjs/common';

@Injectable()
export class SlackService {
    getHello(): string {
        return 'Hello World!';
    }
}
