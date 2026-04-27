const { z } = require('zod');

// Helper for MongoDB ObjectIds
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createInventorySchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters'),
  sport: objectId,
  location: objectId,
  // Use z.coerce to handle form-data strings automatically!
  totalQuantity: z.coerce.number().int().min(0, 'Total quantity cannot be negative'),
});

const updateInventorySchema = z.object({
  itemName: z.string().min(2).optional(),
  sport: objectId.optional(),
  location: objectId.optional(),
  totalQuantity: z.coerce.number().int().min(0).optional(),
});

const reportIssueSchema = z.object({
  damagedAmount: z.coerce.number().int().min(0).default(0),
  lostAmount: z.coerce.number().int().min(0).default(0),
}).refine(data => data.damagedAmount > 0 || data.lostAmount > 0, {
  message: "Must report at least 1 damaged or lost item",
});

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  reportIssueSchema
};