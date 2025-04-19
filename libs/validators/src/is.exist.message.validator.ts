
import { Injectable, Logger } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { DataSource } from 'typeorm';
import { DirectConversationMessages } from '@app/database';

@ValidatorConstraint({ name: 'IsExistUser', async: true })
@Injectable()
export class IsExistMessageValidator implements ValidatorConstraintInterface {
    private readonly logger = new Logger(IsExistMessageValidator.name);
    constructor(private readonly dataSource: DataSource) { }

    async validate(id: number, args: ValidationArguments) {
        try {

            const dmsMessagesRepository = this.dataSource.getRepository(DirectConversationMessages);
            const message = await dmsMessagesRepository.findOne({
                where: { id },
                select: ['id'],
            });

            return message !== null && message !== undefined;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `message with id ${args.value} does not exist`;
    }
}


export function IsExistMessage(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsExistMessage',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsExistMessageValidator,
        });
    };
}