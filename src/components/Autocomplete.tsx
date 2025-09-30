import React, { useState, useRef, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  ViewStyle,
  TextInputProps,
  FlatList,
  Text,
  Pressable,
} from "react-native";
import theme from "./theme";

export interface AutocompleteOption {
  label: string;
  value: string;
  data?: any; // Optional additional data
}

interface AutocompleteProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  /** Current value of the input */
  value: string;
  /** Callback when the value changes */
  onChangeText: (value: string) => void;
  /** Array of options to suggest */
  options: AutocompleteOption[];
  /** Optional custom styles to pass to the input container */
  style?: ViewStyle;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show all options when focused (default: false) */
  showAllOnFocus?: boolean;
  /** Maximum number of options to show (default: 5) */
  maxOptions?: number;
  /** Custom filter function */
  filterOptions?: (
    options: AutocompleteOption[],
    inputValue: string
  ) => AutocompleteOption[];
  /** Callback when an option is selected */
  onOptionSelect?: (option: AutocompleteOption) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChangeText,
  options,
  style,
  placeholder,
  showAllOnFocus = false,
  maxOptions = 5,
  filterOptions,
  onOptionSelect,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Default filter function
  const defaultFilterOptions = (
    options: AutocompleteOption[],
    inputValue: string
  ) => {
    if (!inputValue.trim()) {
      return showAllOnFocus ? options : [];
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const filteredOptions = (filterOptions || defaultFilterOptions)(
    options,
    value
  ).slice(0, maxOptions);

  const shouldShowDropdown = isFocused && filteredOptions.length > 0;

  useEffect(() => {
    setShowDropdown(shouldShowDropdown);
  }, [shouldShowDropdown]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Only update focus state, don't close dropdown
    setIsFocused(false);
  };

  const handleOptionPress = (option: AutocompleteOption) => {
    onChangeText(option.label);
    onOptionSelect?.(option);
    // Close dropdown when option is selected, but don't change focus state
    setShowDropdown(false);
  };

  const renderOption = ({ item }: { item: AutocompleteOption }) => (
    <Pressable
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
      onPress={() => handleOptionPress(item)}
    >
      <Text style={styles.optionText}>{item.label}</Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        style,
        showDropdown && styles.containerWithDropdown,
      ]}
    >
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>

      {showDropdown && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={filteredOptions}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            renderItem={renderOption}
            style={styles.dropdown}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  containerWithDropdown: {
    zIndex: 10000,
    elevation: 1000,
  },
  inputContainer: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  dropdownContainer: {
    position: "absolute",
    top: 52, // Just below the input (50px height + 2px gap)
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 9999, // Very high z-index to appear above other components
    elevation: 999, // Very high elevation for Android
  },
  dropdown: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    maxHeight: 200,
    // Android shadow - very high elevation
    elevation: 1000,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  optionPressed: {
    backgroundColor: theme.colors.secondary,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});

export default Autocomplete;
