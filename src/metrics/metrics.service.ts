import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly register =  new Registry();

    constructor() {
        collectDefaultMetrics({ register: this.register });
    }

    async getMetrics(): Promise<string> {
        return this.register.metrics();
    }

    getContentType(): string {
        return this.register.contentType;
    }
}
