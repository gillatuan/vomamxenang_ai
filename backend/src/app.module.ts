import { Module } from "@nestjs/common"
import { AdminModule } from "./admin/admin.module"
import { AuthModule } from "./auth/auth.module"
import { ClientsModule } from "./clients/clients.module"
import { OrdersModule } from "./orders/orders.module"
import { PostsModule } from "./posts/posts.module"
import { PrismaModule } from "./prisma/prisma.module"
import { ProductsModule } from "./products/products.module"
import { ConfigModule } from "@nestjs/config"
import { LoggerModule } from "nestjs-pino"

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    PrismaModule,
    AuthModule,
    ClientsModule,
    ProductsModule,
    PostsModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
