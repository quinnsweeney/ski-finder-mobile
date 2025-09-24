const theme = {
  colors: {
    // Primary colors
    primary: "#007AFF",
    background: "#1C1C1E", // Very dark grey, almost black

    // Card/Material colors for the "frosted glass" look
    cardBackground: "rgba(44, 44, 46, 0.85)", // Semi-transparent dark grey

    // Text colors
    textPrimary: "#FFFFFF",
    textSecondary: "#EBEBF599", // Light grey with opacity
    placeholder: "#EBEBF54D", // Lighter grey for placeholders

    // Action colors
    secondary: "#3A3A3C", // A solid dark grey for inputs and secondary buttons
    success: "#30D158",
    error: "#FF453A",

    // Separator line color
    separator: "#38383A",

    destructive: "#FF453A", // Apple's red for destructive actions
    border: "#38383A", // A subtle border color

    card: "#1C1C1E",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold" as const,
      color: "#FFFFFF",
    },
    h2: {
      fontSize: 22,
      fontWeight: "bold" as const,
      color: "#FFFFFF",
    },
    h3: {
      fontSize: 22,
      fontWeight: "bold" as const,
    },
    body: {
      fontSize: 17,
      fontWeight: "400" as const,
      color: "#FFFFFF",
    },
    subheadline: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: "#FFFFFF",
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
      color: "#EBEBF599",
    },
  },
  radii: {
    sm: 6,
    md: 12, // A more pronounced corner radius
    lg: 20,
    full: 9999,
  },
};

export type Theme = typeof theme;
export default theme;
