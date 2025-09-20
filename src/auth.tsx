import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "swaraj_erp_auth_state";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        const isLoggedIn = stored === "true";
        console.log(
          "🔍 Initializing auth state from localStorage:",
          isLoggedIn
        );
        return isLoggedIn;
      }
      return false;
    } catch (error) {
      console.warn("Failed to read auth state from localStorage:", error);
      return false;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(AUTH_STORAGE_KEY, isLoggedIn.toString());
        console.log("💾 Auth state saved to localStorage:", isLoggedIn);
      }
    } catch (error) {
      console.warn("Failed to save auth state to localStorage:", error);
    }
  }, [isLoggedIn]);

  const login = () => {
    console.log("🔐 User logging in...");
    setIsLoggedIn(true);
  };

  const logout = () => {
    console.log("🚪 User logging out...");
    setIsLoggedIn(false);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to clear auth state from localStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
