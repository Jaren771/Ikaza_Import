import { BaseRepository } from "@/repositories/base/BaseRepository";
import type { OrderFilters, PaginatedResponse } from "@/types";
import { Prisma } from "@prisma/client";

// =============================================================================
// Order Repository — Acceso a datos de pedidos
// =============================================================================

export class OrderRepository extends BaseRepository {
  /**
   * Obtiene pedidos con filtros y paginación
   */
  async findMany(filters: OrderFilters): Promise<PaginatedResponse<unknown>> {
    const {
      status,
      paymentStatus,
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status: status as Prisma.EnumOrderStatusFilter }),
      ...(paymentStatus && {
        paymentStatus: paymentStatus as Prisma.EnumPaymentStatusFilter,
      }),
      ...(userId && { userId }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    const offset = this.getOffset(page, limit);

    const [data, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          address: true,
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      this.db.order.count({ where }),
    ]);

    return { data, meta: this.buildPaginationMeta(total, page, limit) };
  }

  /**
   * Obtiene un pedido por ID con todas las relaciones
   */
  async findById(id: string) {
    return this.db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        address: true,
        coupon: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  /**
   * Obtiene pedidos de un usuario
   */
  async findByUserId(userId: string, page = 1, limit = 10) {
    const offset = this.getOffset(page, limit);

    const [data, total] = await Promise.all([
      this.db.order.findMany({
        where: { userId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          payments: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      this.db.order.count({ where: { userId } }),
    ]);

    return { data, meta: this.buildPaginationMeta(total, page, limit) };
  }

  /**
   * Crea un pedido con sus items
   */
  async create(data: Prisma.OrderCreateInput) {
    return this.db.order.create({ data });
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(
    id: string,
    status: string,
    trackingNumber?: string,
    notes?: string
  ) {
    return this.db.order.update({
      where: { id },
      data: {
        status: status as any,
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
      },
    });
  }

  /**
   * Actualiza el estado de pago de un pedido
   */
  async updatePaymentStatus(id: string, paymentStatus: string) {
    return this.db.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any },
    });
  }

  /**
   * Estadísticas para el dashboard
   */
  async getStats(dateFrom?: Date, dateTo?: Date) {
    const where = dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {};

    const [totalOrders, revenueResult, pendingOrders] = await Promise.all([
      this.db.order.count({ where }),
      this.db.order.aggregate({
        where: { ...where, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      this.db.order.count({ where: { status: "PENDING" } }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(revenueResult._sum.total ?? 0),
      pendingOrders,
    };
  }
}

export const orderRepository = new OrderRepository();
