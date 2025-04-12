import {
    Column,
    Entity
} from 'typeorm';
import { AbstractEntity } from '../abstract.entity';


@Entity('account')
export class Account extends AbstractEntity<Account> {

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    password: string;
}