const validate = (schema) => async (req, res, next) => {
  try {
    // Parse the request body against the provided Zod schema
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    // Format Zod errors into a clean, readable array of messages
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
};

module.exports = validate;