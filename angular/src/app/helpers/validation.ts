export function isValidEmail(value: string): boolean {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    return Boolean(value?.match(emailRegex));
}