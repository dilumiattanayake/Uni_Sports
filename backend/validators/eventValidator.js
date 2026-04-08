const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createEventSchema = z.object({
  title: z.string().min(2, 'Event title is required'),
  description: z.string().min(5, 'Description is required'),
  sport: objectId,
  startDate: z.coerce.date({ required_error: 'Valid start date is required' }),
  endDate: z.coerce.date({ required_error: 'Valid end date is required' }),
  registrationDeadline: z.coerce.date({ required_error: 'Valid registration deadline is required' }),
  venue: z.string().min(2, 'Venue is required'),
  maxParticipants: z.coerce.number().int().min(1, 'Max capacity must be at least 1'),
  
  // NEW: Team Validation
  eventType: z.enum(['solo', 'team']).default('solo'),
  minTeamSize: z.coerce.number().int().min(2).optional(),
  maxTeamSize: z.coerce.number().int().min(2).optional(),

  registrationFormUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.eventType === 'team') {
    if (!data.minTeamSize || !data.maxTeamSize) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Min and Max team sizes are required for team events", path: ["minTeamSize"] });
    } else if (data.minTeamSize > data.maxTeamSize) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Min team size cannot exceed max team size", path: ["minTeamSize"] });
    }
  }
});

const updateEventSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  sport: objectId.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  registrationDeadline: z.coerce.date().optional(),
  venue: z.string().min(2).optional(),
  maxParticipants: z.coerce.number().int().min(1).optional(),
  
  eventType: z.enum(['solo', 'team']).optional(),
  minTeamSize: z.coerce.number().int().min(2).optional(),
  maxTeamSize: z.coerce.number().int().min(2).optional(),

  registrationFormUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});

module.exports = {
  createEventSchema,
  updateEventSchema
};