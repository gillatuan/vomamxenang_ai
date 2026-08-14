import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminManagementService {
  constructor(private readonly prisma: PrismaService) {}

  products() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { stocks: { select: { quantity: true } }, _count: { select: { orderItems: true, favouriteProducts: true } } },
    });
  }

  wheelRims() {
    return this.prisma.wheelRim.findMany({
      orderBy: { createdAt: 'desc' },
      include: { stocks: { select: { quantity: true } }, _count: { select: { orderItems: true } } },
    });
  }

  warehouses() {
    return this.prisma.warehouse.findMany({
      orderBy: { code: 'asc' },
      include: { locations: { include: { stocks: { select: { quantity: true } } } } },
    });
  }

  priceMatrix() {
    return this.prisma.product.findMany({
      orderBy: { sku: 'asc' },
      select: { id: true, sku: true, name: true, sellingPrice: true, priceMatrix: { select: { id: true, customerType: true, price: true } } },
    });
  }

  upsertPriceMatrix(productId: string, customerType: string, price: number) {
    return this.prisma.priceMatrix.upsert({
      where: { productId_customerType: { productId, customerType } },
      update: { price },
      create: { productId, customerType, price },
    });
  }

  users() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(email: string, password: string, role: 'ADMIN_MANAGER' | 'STOREKEEPER') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({ data: { email, password: hashedPassword, role }, select: { id: true, email: true, role: true, createdAt: true } });
  }

  async updateUser(id: string, data: { role?: 'ADMIN_MANAGER' | 'STOREKEEPER'; password?: string }) {
    const password = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.prisma.user.update({ where: { id }, data: { role: data.role, password }, select: { id: true, email: true, role: true, createdAt: true } });
  }

  deleteProductComment(id: string) { return this.prisma.productComment.delete({ where: { id } }); }
  deletePostComment(id: string) { return this.prisma.postComment.delete({ where: { id } }); }

  productComments() {
    return this.prisma.productComment.findMany({
      include: { product: { select: { id: true, sku: true, name: true } }, user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  postComments() {
    return this.prisma.postComment.findMany({
      include: { post: { select: { id: true, title: true } }, user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async favourites() {
    const groups = await this.prisma.favouriteProduct.groupBy({ by: ['productId'], _count: { _all: true }, orderBy: { _count: { productId: 'desc' } } });
    const products = await this.prisma.product.findMany({ where: { id: { in: groups.map((group) => group.productId) } }, select: { id: true, sku: true, name: true, brand: true } });
    const productById = new Map(products.map((product) => [product.id, product]));
    return groups.map((group) => ({ product: productById.get(group.productId), favouriteCount: group._count._all })).filter((item) => item.product);
  }

  async reports() {
    const [paidOrders, orderCount, clients, stocks] = await Promise.all([
      this.prisma.order.aggregate({ where: { status: OrderStatus.PAID }, _sum: { totalAmount: true }, _avg: { totalAmount: true } }),
      this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
      this.prisma.client.findMany({ select: { id: true, name: true, type: true, orders: { where: { status: OrderStatus.PAID }, select: { totalAmount: true } } } }),
      this.prisma.stockLocation.findMany({ include: { product: { select: { importPrice: true } }, wheelRim: { select: { importPrice: true } } } }),
    ]);
    const inventoryCost = stocks.reduce((sum, stock) => sum + stock.quantity * (stock.product?.importPrice ?? stock.wheelRim?.importPrice ?? 0), 0);
    const topClients = clients.map((client) => ({ id: client.id, name: client.name, type: client.type, revenue: client.orders.reduce((sum, order) => sum + order.totalAmount, 0), orders: client.orders.length })).sort((left, right) => right.revenue - left.revenue).slice(0, 10);
    return { revenue: paidOrders._sum.totalAmount ?? 0, paidOrders: orderCount, averageOrderValue: paidOrders._avg.totalAmount ?? 0, inventoryCost, topClients };
  }
}
