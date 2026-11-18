import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { GameKeyModule } from './game-key/game-key.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [DatabaseModule, UsersModule, GamesModule, GameKeyModule, TransactionsModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
