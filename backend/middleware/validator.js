const validate = (schema) => async (req, res, next) => {
  try {
    // 1. Parse the request body
    await schema.parseAsync(req.body);
    
    // 2. If successful, move to the controller
    next();
  } catch (error) {
    // 3. SAFELY check if it's a Zod error with an 'issues' array
    if (error && Array.isArray(error.issues)) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    // 4. Fallback check for 'errors' array just in case
    if (error && Array.isArray(error.errors)) {
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

    // 5. If it's a completely different backend error, pass it to your teammate's global error handler
    next(error);
  }
};

module.exports = validate;