
import { Injectable, Logger } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { DataSource } from 'typeorm';
import { Account } from '@app/database';

@ValidatorConstraint({ name: 'IsExistUser', async: true })
@Injectable()
export class IsExistUserValidator  implements ValidatorConstraintInterface {
    private readonly logger = new Logger(IsExistUserValidator.name);
    constructor(private readonly dataSource: DataSource) { }

    async validate(id: number, args: ValidationArguments) {
        try {

            const accountRepository = this.dataSource.getRepository(Account);
            const user = await accountRepository.findOne({
                where: { id },
                select: ['id'],
            });

            this.logger.log('user', JSON.stringify(user));

            return user !== null && user !== undefined;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `user with id ${args.value} does not exist`;
    }
}


export function IsExistUser(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsExistServer',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsExistUserValidator,
        });
    };
}