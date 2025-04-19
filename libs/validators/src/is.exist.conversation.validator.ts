// src/validators/is-exist-conversation.validator.ts

import { Injectable, Logger } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { DataSource } from 'typeorm';
import { DirectConversation } from '@app/database';

@ValidatorConstraint({ name: 'isExistConversation', async: true })
@Injectable()
export class IsExistConversationValidator implements ValidatorConstraintInterface {
    private readonly logger: Logger = new Logger(IsExistConversationValidator.name);

    constructor(private readonly dataSource: DataSource) { }

    async validate(id: number, args: ValidationArguments) {
        try {
            const conversationRepository = this.dataSource.getRepository(DirectConversation);
            const conversation = await conversationRepository.findOne({
                where: { id },
                select: ['id'],
            });
            this.logger.log('conversation', JSON.stringify(conversation));

            return conversation !== null && conversation !== undefined;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `Conversation with id ${args.value} does not exist`;
    }
}


export function IsExistConversation(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isExistConversation',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsExistConversationValidator,
        });
    };
}