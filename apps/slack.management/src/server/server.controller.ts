import { Controller, Patch, Post } from '@nestjs/common';

@Controller('server')
export class ServerController {




    @Post()
    async create() {

    }

    @Patch(':id')
    async update() {

    }

}
