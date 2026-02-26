import { z } from "zod";

export const CreatePropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional(),
  autoApprove: z.boolean().optional().default(false),
});

export const CreateReservationSchema = z.object({
  propertyId: z.string().min(1),
  guestId: z.string().min(1),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
});

export const CreateCartSchema = z.object({
  reservationId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
});

export const UpdateCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
});

export const ApproveCartSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const CreateOrderSchema = z.object({
  cartId: z.string().min(1),
  deliveryWindow: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    type: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
    location: z.string().optional(),
  }),
});

export const CreateManagerReviewSchema = z.object({
  reviewerId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const TriggerAgentSchema = z.object({
  reservationId: z.string().min(1),
});

export const UpdateInventoryTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      required: z.boolean().default(true),
    })
  ),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(12),
  role: z.enum(["OWNER", "GUEST", "MANAGER", "ADMIN"]).optional().default("GUEST"),
});
