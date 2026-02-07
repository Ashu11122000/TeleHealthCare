export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  const statusCode = err.statusCode || 500;

  const message =
    err.isOperational && err.message
      ? err.message 
      : "Something went wrong. Please try again later";

  // Log fully error internally
  console.error("❌ ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user?.id || null,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction
      ? {}
      : {
          debug: {
            stack: err.stack,
            type: err.name,
          },
        }),
  });
};