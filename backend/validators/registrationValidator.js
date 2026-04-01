const { z } = require('zod');

// Helper for MongoDB ObjectIds
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID format');

const createRegistrationSchema = z.object({
  registrationType: z.enum(['individual', 'team'], {
    required_error: 'Registration type is required',
    invalid_type_error: "Must be 'individual' or 'team'"
  }),
  // Optional by default, but enforced conditionally below
  teamName: z.string().trim().min(2, 'Team name must be at least 2 characters').optional(),
  // Array of MongoDB ObjectIds for team members
  teamMembers: z.array(objectId).optional().default([]),
}).superRefine((data, ctx) => {
  // Dynamic validation: If it's a team, teamName MUST exist
  if (data.registrationType === 'team' && (!data.teamName || data.teamName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Team name is required for team registrations",
      path: ["teamName"]
    });
  }
});

// Admin validation for manually changing status (e.g., waitlisted -> confirmed)
const updateRegistrationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'waitlisted', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid registration status' })
  })
});

module.exports = {
  createRegistrationSchema,
  updateRegistrationStatusSchema
};