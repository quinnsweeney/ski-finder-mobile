import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import theme from "./theme";

// --- Define the props for the Button component ---
interface ButtonProps {
  /** The text to display inside the button */
  title: string;
  /** Function to execute on press */
  onPress: () => void;
  /** The variant controls the button's appearance */
  variant?: "primary" | "secondary";
  /** The size of the button */
  size?: "medium" | "large";
  /** If true, the button will be disabled and show a loading indicator */
  isLoading?: boolean;
  /** If true, the button will be disabled */
  disabled?: boolean;
  /** Optional custom styles to pass to the button container */
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || isLoading;

  // --- Style definitions using the theme ---

  const baseContainerStyle: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radii.full,
    flexDirection: "row",
  };

  const baseTextStyle: TextStyle = {
    fontWeight: "600", // Semibold weight is common in iOS
  };

  // Styles per variant
  const variantStyles: Record<
    NonNullable<ButtonProps["variant"]>,
    { container: ViewStyle; text: TextStyle }
  > = {
    primary: {
      container: { backgroundColor: theme.colors.primary },
      text: { color: theme.colors.textPrimary },
    },
    secondary: {
      container: { backgroundColor: theme.colors.secondary },
      text: { color: theme.colors.textPrimary },
    },
  };

  // Styles per size
  const sizeStyles: Record<
    NonNullable<ButtonProps["size"]>,
    { container: ViewStyle; text: TextStyle }
  > = {
    medium: {
      container: { height: 44, paddingHorizontal: theme.spacing.lg },
      text: { fontSize: 17 },
    },
    large: {
      container: { height: 50, paddingHorizontal: theme.spacing.lg },
      text: { fontSize: 17 },
    },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        baseContainerStyle,
        variantStyles[variant].container,
        sizeStyles[size].container,
        { opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1.0 },
        style, // Apply custom styles last
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variantStyles[variant].text.color}
          size="small"
        />
      ) : (
        <Text
          style={[
            baseTextStyle,
            variantStyles[variant].text,
            sizeStyles[size].text,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
