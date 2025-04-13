import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class AbstractRepoService<T extends AbstractEntity<T>> {
    protected abstract readonly logger: Logger;

    protected constructor(
        private readonly entityRepository: Repository<T>,
    ) { }

    async create(entity: T): Promise<T> {
        this.logger.log('Creating entity');
        try {
            const instance = this.entityRepository.create(entity);
            return await this.entityRepository.save(instance);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException({
                message: 'Error creating entity',
                error: error.message,
            });
        }
    }

    async save(entity: T): Promise<T> {
        this.logger.log('Saving entity');
        try {
            return await this.entityRepository.save(entity);
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error saving entity',
                error: error.message,
            });
        }
    }

    async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
        this.logger.log('Finding one entity');
        try {
            return await this.entityRepository.findOne({ where });
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error finding entity',
                error: error.message,
            });
        }
    }

    async findOneAndUpdate(
        where: FindOptionsWhere<T>,
        partialEntity: QueryDeepPartialEntity<T>,
    ): Promise<T | null> {
        this.logger.log('Finding one entity and updating');
        try {
            const entity = await this.entityRepository.update(where, partialEntity);
            if (!entity.affected) {
                throw new NotFoundException({
                    message: 'Entity not found',
                });
            }

            return this.findOne(where);
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error finding and updating entity',
                error: error.message,
            });
        }
    }

    async find(where: FindOptionsWhere<T>): Promise<T[]> {
        this.logger.log('Finding entities');
        try {
            return await this.entityRepository.findBy(where);
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error finding entities',
                error: error.message,
            });
        }
    }

    async findOneAndDelete(where: FindOptionsWhere<T>): Promise<void> {
        this.logger.log('Finding one entity and deleting');
        try {
            await this.entityRepository.delete(where);
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error finding and deleting entity',
                error: error.message,
            });
        }
    }

    async paginate(
        where: FindOptionsWhere<T>,
        repository: Repository<T>,
        baseUrl = '',
        page = 1,
        limit = 10,
    ) {
        try {
            const [items, total] = await repository.findAndCount({
                where: where,
                skip: (page - 1) * limit,
                take: limit,
            });

            const totalPages = Math.round((1.0 * total) / limit),
                hasMore = page < totalPages;

            return {
                response: items,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasMore,
                    firstPage: `${baseUrl}?page=1&limit=${limit}`,
                    lastPage: `${baseUrl}?page=${totalPages}&limit=${limit}`,
                    previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
                    next: hasMore ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
                    current: `${baseUrl}?page=${page}&limit=${limit}`,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Error paginating entities',
                error: error.message,
            });
        }
    }
}