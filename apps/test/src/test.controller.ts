import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { AuthGuard } from '@app/auth.common';

@Controller()
export class TestController {
    constructor(private readonly testService: TestService) {}

    @UseGuards(AuthGuard)
    @Get()
    getHello(
        @Req() req
    ): string {
        return this.testService.getHello() + ' ' + req.user.username;
    }
}
