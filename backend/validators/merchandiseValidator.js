const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createMerchandiseSchema = z.object({
  itemName: z.string().min(2, 'Merchandise name is required'),
  sport: objectId,
  category: z.enum(['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A']).default('N/A'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

const updateMerchandiseSchema = z.object({
  itemName: z.string().min(2).optional(),
  category: z.enum(['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other']).optional(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A']).optional(),
  price: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
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