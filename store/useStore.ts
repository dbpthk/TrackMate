import { create } from "zustand";

export type Theme = "dark" | "light";

export type StoreUser = {
  id: number;
  name: string;
  email: string;
};

export type StoreBuddy = {
  id: number;
  name: string;
};

type Store = {
  user: StoreUser | null;
  setUser: (user: StoreUser | null) => void;

  selectedWorkoutId: number | null;
  selectedDate: string | null;
  setSelectedWorkout: (workoutId: number | null, date?: string | null) => void;

  buddies: StoreBuddy[];
  setBuddies: (buddies: StoreBuddy[]) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  selectedWorkoutId: null,
  selectedDate: null,
  setSelectedWorkout: (workoutId, date) =>
    set({ selectedWorkoutId: workoutId, selectedDate: date ?? null }),

  buddies: [],
  setBuddies: (buddies) => set({ buddies }),

  theme: "light",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
}));

// Initialize theme on first client load
if (typeof window !== "undefined") {
  const theme = getInitialTheme();
  useStore.setState({ theme });
  document.documentElement.classList.toggle("dark", theme === "dark");
}
