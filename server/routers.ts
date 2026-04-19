import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getCustomerByUserId,
  upsertCustomer,
  createOrder,
  getOrdersByCustomerId,
  getAllOrders,
  getOrderById,
  createSchedule,
  getSchedulesByDate,
  updateScheduleDeliveryTime,
  markScheduleAsCompleted,
  completeOrder,
  getScheduleByOrderId,
  updateScheduleDate,
  getDb,
  getCustomers,
  updateCustomer,
  getOrdersByDate,
} from "../server/db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  auth: {
    me: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie("session");
      return { success: true };
    }),
  },

  system: systemRouter,

  customer: {
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const customer = await getCustomerByUserId(ctx.user.id);
      if (!customer) {
        return null;
      }
      return customer;
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1),
          phone: z.string().min(1),
          address: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const customer = await getCustomerByUserId(ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer profile not found",
          });
        }

        await updateCustomer(customer.id, {
          fullName: input.fullName,
          phone: input.phone,
          address: input.address,
        });

        return { success: true };
      }),
  },

  order: {
    create: protectedProcedure
      .input(
        z.object({
          deliveryType: z.enum(["pickup", "delivery", "self"]),
          bagCount: z.number().int().positive(),
          paymentMethod: z.enum(["cash", "credit_card", "line_pay", "points"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let customer = await getCustomerByUserId(ctx.user.id);
        let customerId: number;

        if (!customer) {
          // 自動為用戶創建 customer 記錄，並使用返回的 ID
          customerId = await upsertCustomer(ctx.user.id, {
            fullName: ctx.user.name || "User",
            phone: "",
            address: "",
          });
          if (customerId === 0) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create customer profile",
            });
          }
        } else {
          customerId = customer.id;
        }

        const orderId = await createOrder({
          customerId: customerId,
          deliveryType: input.deliveryType,
          bagCount: input.bagCount,
          paymentMethod: input.paymentMethod,
          notes: input.notes || "",
          paymentStatus: "unpaid",
          orderStatus: "pending",
          status: "pending",
        });

        // Create schedule for the order
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await createSchedule({
          orderId: orderId,
          scheduledDate: today,
          deliveryTime: null,
          isCompleted: false,
        });

        return { success: true, orderId: orderId };
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      const customer = await getCustomerByUserId(ctx.user.id);
      if (!customer) {
        return [];
      }

      return await getOrdersByCustomerId(customer.id);
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      // 只有 admin 可以查看所有訂單
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view all orders",
        });
      }

      return await getAllOrders();
    }),

    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // 檢查權限：只有 admin 或訂單所有者可以查看
        if (ctx.user.role !== "admin") {
          const customer = await getCustomerByUserId(ctx.user.id);
          if (!customer || customer.id !== order.customerId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have permission to view this order",
            });
          }
        }

        return order;
      }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.coerce.date() }))
      .query(async ({ ctx, input }) => {
        // 只有 admin 可以按日期查詢訂單
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can query orders by date",
          });
        }

        return await getOrdersByDate(input.date);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "completed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 只有 admin 可以更新訂單狀態
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update order status",
          });
        }

        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (input.status === "completed") {
          await completeOrder(input.orderId);
        }

        return { success: true };
      }),
  },

  schedule: {
    getByDate: protectedProcedure
      .input(z.object({ date: z.coerce.date() }))
      .query(async ({ ctx, input }) => {
        // 只有 admin 可以查詢排程
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view schedules",
          });
        }

        return await getSchedulesByDate(input.date);
      }),

    updateDeliveryTime: protectedProcedure
      .input(
        z.object({
          scheduleId: z.number(),
          deliveryTime: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 只有 admin 可以更新配送時間
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update delivery time",
          });
        }

        await updateScheduleDeliveryTime(input.scheduleId, input.deliveryTime);
        return { success: true };
      }),

    markAsCompleted: protectedProcedure
      .input(z.object({ scheduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // 只有 admin 可以標記排程為已完成
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can mark schedules as completed",
          });
        }

        await markScheduleAsCompleted(input.scheduleId);
        return { success: true };
      }),

    updateDate: protectedProcedure
      .input(
        z.object({
          scheduleId: z.number(),
          newDate: z.coerce.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 只有 admin 可以更新排程日期
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update schedule date",
          });
        }

        await updateScheduleDate(input.scheduleId, input.newDate);
        return { success: true };
      }),
  },
});

export type AppRouter = typeof appRouter;
