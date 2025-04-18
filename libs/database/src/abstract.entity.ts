import { PrimaryGeneratedColumn } from 'typeorm';

export class AbstractEntity<T> {
    @PrimaryGeneratedColumn()
    id: number;

    constructor(entity: Partial<T> = {} as Partial<T>) {
        Object.assign(this, entity);
    }
}