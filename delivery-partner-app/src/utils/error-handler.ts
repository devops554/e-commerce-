// src/utils/error-handler.ts

import { AxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from an error object, 
 * handles Axios errors specifically.
 */
export const getErrorMessage = (error: any): string => {
    if (error?.isAxiosError || error?.response) {
        const axiosError = error as AxiosError<any>;

        // 1. The server responded with a status code that falls out of the range of 2xx
        if (axiosError.response) {
            const data = axiosError.response.data;
            const status = axiosError.response.status;

            // Check for specific error message from backend
            if (data?.message) return data.message;
            if (data?.error) return data.error;

            // Fallback based on status code
            switch (status) {
                case 400: return 'Invalid request. Please check your inputs.';
                case 401: return 'Invalid phone number or password.';
                case 403: return 'You do not have permission to perform this action.';
                case 404: return 'The requested resource was not found.';
                case 429: return 'Too many attempts. Please try again later.';
                case 500: return 'Server error. Please try again later.';
                default: return `Request failed with status ${status}.`;
            }
        }

        // 2. The request was made but no response was received
        if (axiosError.request) {
            return 'Network error. Please check your internet connection.';
        }
    }

    // 3. Something happened in setting up the request that triggered an Error
    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
};
