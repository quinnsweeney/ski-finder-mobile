import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "./theme";

export interface DropdownOption {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  title,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
  };

  const renderDifficultyIcon = (option: DropdownOption) => {
    if (option.icon) {
      return (
        <View
          style={[styles.difficultyIcon, { backgroundColor: option.color }]}
        >
          <Text style={styles.difficultyIconText}>{option.icon}</Text>
        </View>
      );
    }
    return null;
  };

  const renderOption = (option: DropdownOption) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.option,
        selectedValue === option.value && styles.optionSelected,
      ]}
      onPress={() => handleSelect(option.value)}
      activeOpacity={0.7}
    >
      {renderDifficultyIcon(option)}
      <Text
        style={[
          styles.optionText,
          selectedValue === option.value && styles.optionTextSelected,
        ]}
      >
        {option.label}
      </Text>
      {selectedValue === option.value && (
        <Ionicons
          name="checkmark"
          size={20}
          color={theme.colors.primary}
          style={styles.checkmark}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          isVisible && styles.dropdownActive,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={styles.dropdownContent}>
          {selectedOption ? (
            <View style={styles.selectedContent}>
              {renderDifficultyIcon(selectedOption)}
              <Text style={styles.selectedText}>{selectedOption.label}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>

        <Ionicons
          name={isVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color={
            disabled ? theme.colors.placeholder : theme.colors.textSecondary
          }
          style={styles.chevron}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            {title && <Text style={styles.modalTitle}>{title}</Text>}

            <ScrollView
              style={styles.optionsContainer}
              showsVerticalScrollIndicator={false}
            >
              {options.map(renderOption)}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Predefined difficulty options for trail difficulty selection
export const DIFFICULTY_OPTIONS: DropdownOption[] = [
  {
    label: "Green (Easiest)",
    value: "green",
    color: "#30D158",
    icon: "●",
  },
  {
    label: "Blue (Intermediate)",
    value: "blue",
    color: "#007AFF",
    icon: "■",
  },
  {
    label: "Blue/Black (Advanced)",
    value: "blue_black",
    color: "#007AFF",
    icon: "■♦",
  },
  {
    label: "Black (Advanced)",
    value: "black",
    color: "#000000",
    icon: "♦",
  },
  {
    label: "Double Black (Expert)",
    value: "double_black",
    color: "#000000",
    icon: "♦♦",
  },
];

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  title: {
    ...theme.typography.subheadline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  dropdown: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownActive: {
    borderColor: theme.colors.primary,
  },
  dropdownContent: {
    flex: 1,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.placeholder,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  difficultyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  difficultyIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    width: "100%",
    maxWidth: 400,
    maxHeight: "70%",
    paddingVertical: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  optionsContainer: {
    maxHeight: 300,
    paddingHorizontal: theme.spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    marginVertical: theme.spacing.xs,
  },
  optionSelected: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    marginLeft: theme.spacing.sm,
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
});

export default Dropdown;
