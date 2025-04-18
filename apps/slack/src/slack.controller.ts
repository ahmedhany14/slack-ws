import { Controller, Get } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller()
export class SlackController {
    constructor(private readonly slackService: SlackService) {}

    @Get()
    getHello(): string {
        return this.slackService.getHello();
    }
}
