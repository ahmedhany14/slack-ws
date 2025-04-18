import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { catchError, first, map, tap } from 'rxjs';

import { AUTH_SERVICE } from '@app/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WsException } from '@nestjs/websockets';
import { SocketI } from '../interfaces/socket.client.interface';
import { IWsAuthenticateRequest } from '@app/auth.common';
import { AbstractRepoService, DirectConversation } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class DmsService extends AbstractRepoService<DirectConversation> {
    protected readonly logger: Logger = new Logger(DmsService.name);

    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
        @InjectRepository(DirectConversation)
        private readonly directConversationRepository: Repository<DirectConversation>,

    ) {
        super(directConversationRepository);
    }

    async authenticate(request: IWsAuthenticateRequest): Promise<{ id: number; username: string }> {
        // resolve the type of request in the future
        this.logger.log('authenticate user to connect to dms');
        try {
            const response = await this.authClient
                .send('ws-authenticate', request)
                .pipe(
                    map((response) => {
                        if (response) {
                            console.log('user authenticated');
                            return response;
                        } else {
                            throw new WsException('You are not authorized to access this resource');
                        }
                    }),
                    catchError((error) => {
                        this.logger.error('Error authenticating user', error);
                        throw new WsException('You are not authorized to access this resource');
                    }),
                    first(),
                )
                .toPromise();

            if (!response) {
                throw new WsException('You are not authorized to access this resource');
            }

            return {
                id: response.id,
                username: response.username,
            };
        } catch (error) {
            this.logger.log('Error authenticating user');
            throw new WsException('You are not authorized to access this resource');
        }
    }

    extractToken(socket: SocketI): string | null {
        const tokenFromAuth = socket.handshake?.auth?.token;
        if (tokenFromAuth) return tokenFromAuth;
        const tokenFromHeaders = socket.handshake?.headers?.authorization;
        if (tokenFromHeaders) {
            const [bearer, token] = tokenFromHeaders.split(' ');
            if (bearer === 'Bearer' && token) {
                return token;
            }
        }
        return null;
    }


    async findAllMyDms(
        user_id: number,
    ) {
        const conversation_started_by_user = await this.find({ // all conversations started by the user to the recipient
            conversation_initiator: { id: user_id },
        });

        const conversation_started_by_recipient = await this.find({ // all conversations started by the recipient to the user
            conversation_recipient: { id: user_id },
        });


        const combined_conversations = [
            // extract recipient from the conversation started by the user

            conversation_started_by_user.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_recipient.id,
                        username: conversation.conversation_recipient.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                };
            }),

            conversation_started_by_recipient.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_initiator.id,
                        username: conversation.conversation_initiator.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                };
            })
            // extract initiator from the conversation started by the recipient

        ]

        return combined_conversations
    }


}
