import { Injectable, Logger } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { DataSource } from 'typeorm';
import { Server } from '@app/database';

@ValidatorConstraint({ name: 'IsExistServer', async: true })
@Injectable()
export class IsExistServerValidator  implements ValidatorConstraintInterface {
    private readonly logger = new Logger(IsExistServerValidator.name);
    constructor(private readonly dataSource: DataSource) { }

    async validate(server_id: number, args: ValidationArguments) {
        try {

            const serverRepository = this.dataSource.getRepository(Server);
            const server = await serverRepository.findOne({
                where: { id:  server_id },
                select: ['id'],
            });

            this.logger.log('server', JSON.stringify(server));

            return server !== null && server !== undefined;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `server with id ${args.value} does not exist`;
    }
}


export function IsExistServer(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsExistServer',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsExistServerValidator,
        });
    };
}