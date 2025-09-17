import { ThemeProvider as BaseThemeProvider } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider>{children}</BaseThemeProvider>;
}

export { useTheme } from "@/hooks/use-theme";
