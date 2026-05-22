import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data = {}) => {
    return NextResponse.json({
        success, statusCode, message, data
    }, { status: statusCode })
}

export const catchError = (error, customMessage) => {
    let errorObj = {};
    if (error.code === 11000) {
        const keys = Object.keys(error.keyPattern).join(',');
        error.message = `Duplicate field: ${keys}. These fields values must be unique.`;
    }
    if (process.env.NODE_ENV === 'development') {
        errorObj = {
            message: error.message,
            error
        };
    } else {
        errorObj = {
            message: customMessage || 'Internal server error.',
            error
        };
    }
    console.error("API Error:", error);
    const statusCode = typeof error.code === 'number' ? error.code : 500;
    return response(false, statusCode, errorObj.message, errorObj.error);
}