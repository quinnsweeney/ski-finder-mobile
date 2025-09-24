import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import theme from "./theme";

interface CardProps {
  /** The content to display inside the card */
  children: React.ReactNode;
  /** Optional custom styles to pass to the card container */
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    // Note: For a true "frosted glass" effect, you would use a library
    // like @react-native-community/blur, but this provides a great
    // look with standard components.
  },
});

export default Card;
