// src/validators/is-exist-conversation.validator.ts

import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { DmsService } from '../dms/dms.service';

@ValidatorConstraint({ name: 'isExistConversation', async: true })
@Injectable()
export class IsExistConversationValidator implements ValidatorConstraintInterface {
    constructor(private readonly dmsService: DmsService) { }

    async validate(id: number, args: ValidationArguments) {
        try {
            const conversation = await this.dmsService.findOne({
                id
            });
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