import { useState, useEffect, useCallback } from "react";
import { privateApiRequest } from "../api";

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: number;
    email: string;
  };
}

interface AuthState {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  user: AuthCheckResponse["user"] | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    isLoading: true,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await privateApiRequest<AuthCheckResponse>(
        "/check-auth"
      );

      if (response.authenticated && response.user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: response.user,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return authState;
}
