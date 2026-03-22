const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createMerchandiseSchema = z.object({
  itemName: z.string().min(2, 'Merchandise name is required'),
  sport: objectId,
  category: z.enum(['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other']),
  variants: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must provide at least one variant" });
        return z.NEVER;
      }
      return parsed;
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid variants format" });
      return z.NEVER;
    }
}),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});

const updateMerchandiseSchema = z.object({
  itemName: z.string().min(2).optional(),
  sport: objectId.optional(),
  category: z.enum(['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other']).optional(),
  price: z.coerce.number().min(0).optional(),
  
  // Parse stringified variants array for updates
  variants: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must provide at least one variant" });
        return z.NEVER;
      }
      return parsed;
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid variants format" });
      return z.NEVER;
    }
  }).optional(),
});

const createOrderSchema = z.object({
  quantity: z.number().int().min(1, 'Must order at least 1 item')
});

const updateOrderStatusSchema = z.object({
  paymentStatus: z.enum(['Pending', 'Paid', 'Free Issue']).optional(),
  fulfillmentStatus: z.enum(['Processing', 'Ready for Pickup', 'Delivered/Handed Over']).optional(),
}).refine(data => data.paymentStatus || data.fulfillmentStatus, {
  message: "Must provide either paymentStatus or fulfillmentStatus to update"
});

module.exports = {
  createMerchandiseSchema,
  updateMerchandiseSchema,
  createOrderSchema,
  updateOrderStatusSchema
};