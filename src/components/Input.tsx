import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  ViewStyle,
  TextInputProps,
} from "react-native";
import theme from "./theme";

// We extend the default TextInputProps to allow passing any standard prop
interface InputProps extends TextInputProps {
  /** Optional custom styles to pass to the input container */
  style?: ViewStyle;
}

const Input: React.FC<InputProps> = ({ style, ...props }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.placeholder}
        {...props} // Pass all other props (like value, onChangeText, placeholder)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 50, // A standard iOS input height
    justifyContent: "center",
  },
  input: {
    ...theme.typography.body, // Use body text style
    color: theme.colors.textPrimary,
  },
});

export default Input;
