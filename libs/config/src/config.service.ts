import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.interface';

@Injectable()
export class ConfigService {
    constructor(private readonly nestConfigService: NestConfigService<Config>) { }

    get authAppConfig(): Config['authApp'] | undefined {
        return this.nestConfigService.get<Config['authApp']>('authApp');
    }

    get authConfig(): Config['authConfig'] | undefined {
        return this.nestConfigService.get<Config['authConfig']>('authConfig');
    }

    get dbConfig(): Config['dbConfig'] | undefined {
        return this.nestConfigService.get<Config['dbConfig']>('dbConfig');
    }

    get slackConfig(): Config['slackConfig'] | undefined {
        return this.nestConfigService.get<Config['slackConfig']>('slackConfig');
    }

    get socialNetworkConfig(): Config['socialNetworkConfig'] | undefined {
        return this.nestConfigService.get<Config['socialNetworkConfig']>('socialNetworkConfig');
    }
}