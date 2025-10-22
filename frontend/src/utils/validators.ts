export function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPasswordStrong(password: string) {
  return password.length >= 6;
}
