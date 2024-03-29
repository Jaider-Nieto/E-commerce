import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { redisStore } from 'cache-manager-redis-yet'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ChatSupportModule } from './modules/chat-support/chat-support.module'
import { ProductsModule } from './modules/products/products.module'
import { ShoppingCartModule } from './modules/shopping-cart/shopping-cart.module'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configModule: ConfigService) => ({
        type: 'postgres',
        host: configModule.get('DB_HOST') || 'localhost',
        port: configModule.get('DB_PORT'),
        username: configModule.get('DB_USER'),
        password: configModule.get('DB_PASSWORD'),
        database: configModule.get('DB_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configModule: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configModule.get('REDIS_HOST') || 'localhost',
            port: configModule.get('REDIS_PORT'),
          },
          ttl: configModule.get('TTL'),
        }),
      }),
    }),
    UsersModule,
    ProductsModule,
    ShoppingCartModule,
    ChatSupportModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static port: number

  constructor(private readonly configModule: ConfigService) {
    AppModule.port = Number(this.configModule.get('PORT'))
  }
}
