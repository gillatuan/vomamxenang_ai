import { SeoModule } from "./seo/seo.module"
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
import { APP_INTERCEPTOR } from "@nestjs/core"
import { FinancialDataInterceptor } from "./auth/financial-data.interceptor"
import { AiModule } from "./ai/ai.module"
import { StoreInfoModule } from "./store-info/store-info.module"
import { AboutModule } from "./about/about.module"
import { DailyContentModule } from "./daily-content/daily-content.module"
import { CustomerChatModule } from "./customer-chat/customer-chat.module"
import { MediaModule } from "./media/media.module"
import { QuoteLeadsModule } from "./quote-leads/quote-leads.module"
import { SalesQuotesModule } from "./sales-quotes/sales-quotes.module"
import { CaseStudiesModule } from "./case-studies/case-studies.module"
import { ConversionAnalyticsModule } from "./conversion-analytics/conversion-analytics.module"
import { HealthModule } from "./health/health.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
    }),
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
    AiModule,
    StoreInfoModule,
    AboutModule,
    SeoModule,
    DailyContentModule,
    MediaModule,
    CustomerChatModule,
    QuoteLeadsModule,
    SalesQuotesModule,
    CaseStudiesModule,
    ConversionAnalyticsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: FinancialDataInterceptor,
    },
  ],
})
export class AppModule {}
