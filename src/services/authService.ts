// src/services/authService.ts

// Mock login function
export async function login(email: string, password: string) {
  // Hardcoded dummy users
  if (email === "admin@kutumbcare.com" && password === "admin123") {
    return {
      token: "fake-jwt-token",
      user: { name: "Admin User", email: "admin@kutumbcare.com" }
    };
  }

  if (email === "family@kutumbcare.com" && password === "family123") {
    return {
      token: "fake-jwt-token",
      user: { name: "Family Member", email: "family@kutumbcare.com" }
    };
  }

  throw new Error("Invalid credentials");
}

// Mock signup function
export async function signup(email: string, password: string) {
  return {
    token: "fake-jwt-token",
    user: { name: "New User", email }
  };
}
