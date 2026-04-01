const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createBorrowRequestSchema = z.object({
  items: z.array(
    z.object({
      equipment: objectId,
      quantity: z.number().int().min(1, 'Must request at least 1 item')
    })
  ).min(1, 'Must request at least one type of equipment'),
  
  expectedReturnDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Return date must be in the future',
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

const updateRequestStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Borrowed', 'Returned', 'Overdue'], {
    errorMap: () => ({ message: 'Invalid status update' })
  }),
  notes: z.string().optional()
});

const reportIssueOnRequestSchema = z.object({
  itemId: objectId,
  damagedQuantity: z.number().int().min(0).default(0),
  lostQuantity: z.number().int().min(0).default(0),
  issueNote: z.string().min(3, 'Please provide details about the issue')
}).refine(data => data.damagedQuantity > 0 || data.lostQuantity > 0, {
  message: "Must report at least 1 damaged or lost item",
});

module.exports = {
  createBorrowRequestSchema,
  updateRequestStatusSchema,
  reportIssueOnRequestSchema
};