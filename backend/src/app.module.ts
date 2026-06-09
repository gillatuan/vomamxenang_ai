import { Module } from "@nestjs/common"
import { AdminModule } from "./admin/admin.module"
import { AuthModule } from "./auth/auth.module"
import { ClientsModule } from "./clients/clients.module"
import { OrdersModule } from "./orders/orders.module"
import { PostsModule } from "./posts/posts.module"
import { PrismaModule } from "./prisma/prisma.module"
import { ProductsModule } from "./products/products.module"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { LoggerModule } from "nestjs-pino"
import { CategoryModule } from "./category/category.module"
import { WarehouseModule } from "./warehouse/warehouse.module"
import { InventoryModule } from "./inventory/inventory.module"
import { SupplierModule } from "./supplier/supplier.module"
import { WheelRimsModule } from "./wheel-rims/wheel-rims.module"
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core"
import { FinancialDataInterceptor } from "./auth/financial-data.interceptor"

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    ProductsModule,
    PostsModule,
    OrdersModule,
    AdminModule,
    CategoryModule,
    WarehouseModule,
    InventoryModule,
    SupplierModule,
    WheelRimsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: FinancialDataInterceptor,
    },
  ],
})
export class AppModule {}
