export function extractErrorMessage(error) {
    let message = 'An error occurred';
    if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
    }
    if (typeof error === 'string') {
        message = error;
    }
    return { message };
}
//# sourceMappingURL=extract_error_message.js.map