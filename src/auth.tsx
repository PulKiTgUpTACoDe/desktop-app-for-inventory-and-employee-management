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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Queue any authAPI calls until it's ready
  const queueAuthCall = (fnName: "login" | "logout") => {
    const interval = setInterval(() => {
      if (window.authAPI && typeof window.authAPI[fnName] === "function") {
        window.authAPI[fnName]();
        clearInterval(interval);
      }
    }, 50);
  };

  // Fetch login state safely
  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        window.authAPI &&
        typeof window.authAPI.getLoginState === "function"
      ) {
        clearInterval(interval);
        try {
          const state = await window.authAPI.getLoginState();
          setIsLoggedIn(state);
        } catch (err) {
          console.error("Failed to fetch login state", err);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    queueAuthCall("login");
  };

  const logout = () => {
    setIsLoggedIn(false);
    queueAuthCall("logout");
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
