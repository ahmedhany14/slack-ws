import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { DmsService } from './dms.service';

@UseGuards(AuthGuard)
@Controller('dms')
export class DmsController {

    constructor(
        private readonly dmsService: DmsService
    ) { }

    @Get()
    async getMyConversations(
        @ExtractUserData('id') id: number
    ) {
        return await this.dmsService.findAllMyDms(id);
    }

    // TODO: Authorize that the conversation exists and the user is part of it
    @Delete(':conversation_id')
    async deleteConversation(
        @Param('conversation_id') conversation_id: number,
    ) {

        await this.dmsService.findOneAndDelete({
            id: conversation_id
        })

        return {
            message: 'Conversation deleted'
        }
    }


    // TODO: impelent endpoint to retrieve conversation metadata, like mutual friends, etc...
    /**
     * Endpoint to retrieve conversation metadata
     * Authorize that the conversation exists and the user is part of it
     * @param conversation_id 
     * @return conversation metadata
     */

    // TODO: implement endpoint to retrieve conversation messages
    /**
     * Endpoint to retrieve conversation messages
     * Authorize that the conversation exists and the user is part of it
     * @param conversation_id 
     * @return conversation messages
     */

    // TODO: implement endpoint to retrieve conversation messages by page
    /**
     * Endpoint to retrieve conversation messages by page (pagination)
     * Authorize that the conversation exists and the user is part of it
     * @param conversation_id
     * @param page
     * @param limit
     * @return conversation messages
     */


    // TODO: impelement endpoint to delete message
    /**
     * Endpoint to delete message
     * Authorize that the conversation exists and the user is part of it
     * Authorize that message exists and belongs to the conversation
     * Authorize that creator of the message is the user
     * @param message_id
     * @return message deleted
     */

}
