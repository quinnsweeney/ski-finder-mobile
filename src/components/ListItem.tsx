import React from "react";
import { View, Text, StyleSheet, Pressable, ViewStyle } from "react-native";
import theme from "./theme";

interface ListItemProps {
  /** The main text to display */
  title: string;
  /** The smaller text to display below the title */
  subtitle?: string;
  /** An optional element to display on the left side (e.g., an icon) */
  leading?: React.ReactNode;
  /** An optional element to display on the right side (e.g., a chevron or button) */
  trailing?: React.ReactNode;
  /** Function to execute when the item is pressed */
  onPress?: () => void;
  /** Optional custom styles for the container */
  style?: ViewStyle;
  /** Whether to show a separator line at the bottom */
  showSeparator?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  style,
  showSeparator = true,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: theme.colors.secondary },
        style,
      ]}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {leading && <View style={styles.leadingContainer}>{leading}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {trailing && <View style={styles.trailingContainer}>{trailing}</View>}
      </View>
      {showSeparator && <View style={styles.separator} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: theme.spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    paddingRight: theme.spacing.md,
  },
  leadingContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  trailingContainer: {
    marginLeft: theme.spacing.md,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.md,
  },
});

export default ListItem;
