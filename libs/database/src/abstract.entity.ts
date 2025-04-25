import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

export class AbstractEntity<T> {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp with time zone',
        nullable: true,
        default: null,
    })
    updated_at: Date;

    @DeleteDateColumn({
        type: 'timestamp with time zone',
        nullable: true,
        default: null,
    })
    deleted_at: Date;

    constructor(entity: Partial<T> = {} as Partial<T>) {
        Object.assign(this, entity);
    }
}
