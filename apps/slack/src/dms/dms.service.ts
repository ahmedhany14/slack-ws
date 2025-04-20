import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// services, entities, repositories
import { FriendsService } from '../friends/friends.service';
import { AbstractRepoService, DirectConversation } from '@app/database';

// interfaces, dtos
import { MutualFriend } from './interfaces/mutual.friends.interface';
import { FormattedConversationI } from './interfaces/conversation.interfaces';
import { SendDmMessageDto } from '../messages/dtos/send.dm.message.dto';

@Injectable()
export class DmsService extends AbstractRepoService<DirectConversation> {
    protected readonly logger: Logger = new Logger(DmsService.name);

    constructor(
        @InjectRepository(DirectConversation)
        private readonly directConversationRepository: Repository<DirectConversation>,
        @Inject()
        private readonly friendsService: FriendsService,
    ) {
        super(directConversationRepository);
    }

    /**
     * Retrieves all DM conversations for a user
     */
    async findAllMyDms(userId: number): Promise<FormattedConversationI[]> {
        const [initiatedConversations, receivedConversations] = await Promise.all([
            this.getInitiatedConversations(userId),
            this.getReceivedConversations(userId),
        ]);

        const combinedConversations = this.combineAndFormatConversations(
            initiatedConversations,
            receivedConversations,
        );

        return this.sortConversationsByDate(combinedConversations);
    }

    /**
     * Finds existing DM conversation or creates a new one
     */
    async findOrCreateDm(
        sendDmMessageDto: SendDmMessageDto,
        initiatorId: number,
    ): Promise<DirectConversation> {
        const existingConversation = await this.findExistingConversation(
            initiatorId,
            sendDmMessageDto.conversation_recipient,
        );

        if (existingConversation) {
            return existingConversation;
        }

        return this.createNewConversation(initiatorId, sendDmMessageDto.conversation_recipient);
    }

    /**
     * Finds mutual friends between two users
     */
    async findMutualFriends(initiatorId: number, recipientId: number): Promise<MutualFriend[]> {
        return this.friendsService.findMutualFriends(initiatorId, recipientId);
    }

    private async getInitiatedConversations(userId: number): Promise<DirectConversation[]> {
        return this.find({
            conversation_initiator: { id: userId },
        });
    }

    private async getReceivedConversations(userId: number): Promise<DirectConversation[]> {
        return this.find({
            conversation_recipient: { id: userId },
        });
    }

    private formatConversation(
        conversation: DirectConversation,
        isInitiator: boolean,
    ): FormattedConversationI {
        const recipient = isInitiator
            ? conversation.conversation_recipient
            : conversation.conversation_initiator;

        return {
            id: conversation.id,
            conversation_recipient: {
                id: recipient.id,
                username: recipient.username,
            },
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            last_message: conversation.last_message,
        };
    }

    private combineAndFormatConversations(
        initiatedConversations: DirectConversation[],
        receivedConversations: DirectConversation[],
    ): FormattedConversationI[] {
        return [
            ...initiatedConversations.map((conv) => this.formatConversation(conv, true)),
            ...receivedConversations.map((conv) => this.formatConversation(conv, false)),
        ];
    }

    private sortConversationsByDate(
        conversations: FormattedConversationI[],
    ): FormattedConversationI[] {
        return [...conversations].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
    }

    private async findExistingConversation(
        initiatorId: number,
        recipientId: number,
    ): Promise<DirectConversation | null> {
        const conversation =
            (await this.findOne({
                conversation_initiator: { id: initiatorId },
                conversation_recipient: { id: recipientId },
            })) ||
            (await this.findOne({
                conversation_initiator: { id: recipientId },
                conversation_recipient: { id: initiatorId },
            }));

        return conversation || null;
    }

    private async createNewConversation(
        initiatorId: number,
        recipientId: number,
    ): Promise<DirectConversation> {
        return this.create({
            conversation_initiator: { id: initiatorId },
            conversation_recipient: { id: recipientId },
        } as DirectConversation);
    }
}
