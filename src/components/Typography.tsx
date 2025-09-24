import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import theme from "./theme";

type TypographyLevel = "h1" | "h2" | "h3" | "body" | "caption";
type TypographyColor = "primary" | "secondary" | "destructive";

interface TypographyProps extends TextProps {
  level?: TypographyLevel;
  color?: TypographyColor;
  children: React.ReactNode;
}

const AppText: React.FC<TypographyProps> = ({
  level = "body",
  color = "primary",
  style,
  children,
  ...props
}) => {
  const textStyle = styles[level];
  const colorStyle = colorStyles[color];

  return (
    <Text style={[textStyle, colorStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    ...theme.typography.h1,
  },
  h2: {
    ...theme.typography.h2,
  },
  h3: {
    ...theme.typography.h3,
  },
  body: {
    ...theme.typography.body,
  },
  caption: {
    ...theme.typography.caption,
  },
});

const colorStyles = StyleSheet.create({
  primary: {
    color: theme.colors.textPrimary,
  },
  secondary: {
    color: theme.colors.textSecondary,
  },
  destructive: {
    color: theme.colors.destructive,
  },
});

export default AppText;
