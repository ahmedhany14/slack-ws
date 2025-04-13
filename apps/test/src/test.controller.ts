import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { AuthGuard } from '@app/auth.common';
import { ClientProxy } from '@nestjs/microservices';
import { SLACK_SERVICE } from '@app/constants';
import { catchError, map, tap } from 'rxjs';

@Controller()
export class TestController {
    constructor(
        private readonly testService: TestService,
        @Inject(SLACK_SERVICE) private readonly authClient: ClientProxy
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    getHello(
        @Req() req
    ): string {
        return this.testService.getHello() + ' ' + req.user.username;
    }

    @Get('server-data/:server_id')
    async getServerData(
        @Param('server_id') serverId: string,
        @Req() req: any
    ) {
        return this.authClient.send('server.get.details', {
            id: serverId,
            headers: {
                authorization: req.headers.authorization,
            }
        })
            .pipe(
                tap((response) => {
                    console.log('response', response);
                })
                ,
                map((response) => {
                    if (response) {
                        return response;
                    } else {
                        throw new Error('Server not found');
                    }
                }),
                catchError((error) => {
                    console.log('error', error);
                    throw new Error('Server not found');
                })
            )
    }
}
