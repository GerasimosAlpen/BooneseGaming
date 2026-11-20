import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TransactionsModule } from './transactions.module';
import { SqliteService } from '../database/sqlite.service';

describe('TransactionsController (Purchase Workflow)', () => {
  let app: INestApplication;
  let sqliteService: SqliteService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sqliteService = moduleFixture.get<SqliteService>(SqliteService);
  });

  beforeEach(async () => {
    await sqliteService.run('DELETE FROM transactions');
    await sqliteService.run("UPDATE game_keys SET status = 'AVAILABLE'");
  });

  afterAll(async () => {
    await sqliteService.run('DELETE FROM transactions');
    await sqliteService.run("UPDATE game_keys SET status = 'AVAILABLE'");
    await app.close();
  });

  describe('POST /transactions/purchase', () => {
    it('1. Succeeded - Case pembelian yang passed: return 201, activation key, marking dengan nilai "SOLD" di database', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/purchase')
        .send({
          userId: 2,
          gameId: 1,
        });

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('key');
      expect(typeof response.body.key).toBe('string');
      expect(response.body.key).toBeTruthy();

      const updatedKey = await sqliteService.get<{ status: string }>(
        'SELECT status FROM game_keys WHERE key_code = ?',
        [response.body.key],
      );
      expect(updatedKey).toBeDefined();
      expect(updatedKey?.status).toBe('SOLD');
    });

    it('2. Failed - Vaslidasi barang habis: return 400 dan tidak terbuatnya sebuah transaksi baru', async () => {
      await sqliteService.run(
        "UPDATE game_keys SET status = 'SOLD' WHERE game_id = ?",
        [2],
      );

      const beforeTxCount = await sqliteService.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM transactions',
      );

      const response = await request(app.getHttpServer())
        .post('/transactions/purchase')
        .send({
          userId: 2,
          gameId: 2,
        });

      expect(response.status).toBe(400);

      const afterTxCount = await sqliteService.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM transactions',
      );
      expect(afterTxCount?.count).toBe(beforeTxCount?.count);
    });

    it('3. Failed - Game tidak ditemukan: return 404 dan id dari barang yang sudah habis', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/purchase')
        .send({
          userId: 2,
          gameId: 9999,
        });

      expect(response.status).toBe(404);
    });
  });
});
