import { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
  statusCode?: number;
  code?: number | string; // for MongoDB duplicate key error
  keyValue?: Record<string, any>; // for 11000 duplicate
  errors?: Record<string, { message: string }>; // for ValidationError
  path?: string;
}

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Default values
    let statusCode = err.statusCode ?? 500;
    let message = err.message || "Internal Server Error";

    // 1. Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
      statusCode = 404;
      message = `Resource not found - Invalid ${err.path || "ID"}`;
    }

    // 2. Mongoose duplicate key error (E11000)
    if (err.code === 11000) {
      statusCode = 409;
      const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
      const value = err.keyValue?.[field];
      message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } "${value}" already exists`;
    }

    // 3. Mongoose ValidationError
    if (err.name === "ValidationError" && err.errors) {
      statusCode = 400;
      message =
        Object.values(err.errors)
          .map((val: any) => val.message)
          .filter(Boolean)
          .join(", ") || "Validation failed";
    }

    // 4. JWT errors
    if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid or malformed token";
    }

    if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Access token has expired";
    }

    // 5. Optional: handle other common libraries
    // if (err.name === 'MulterError') { ... }

    console.error("[ERROR]", {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
    });

    // Send consistent response
    const isDev = process.env.NODE_ENV === "development";

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(isDev && { stack: err.stack }),
    });
  } catch (secondaryError) {
    console.error("Error inside error middleware:", secondaryError);
    res.status(500).json({
      success: false,
      error:
        "Internal server error - something went wrong while handling the error",
    });

    // Do NOT call next() here — it would cause infinite loop if next middleware also fails
  }
};

export default errorMiddleware;
