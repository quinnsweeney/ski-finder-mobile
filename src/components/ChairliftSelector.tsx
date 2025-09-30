import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "./theme";
import { fetchResortLifts, Lift } from "../services/liftService";

export interface ChairliftSelectorProps {
  resortId: number;
  selectedLiftIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  title?: string;
  maxHeight?: number;
}

const ChairliftSelector: React.FC<ChairliftSelectorProps> = ({
  resortId,
  selectedLiftIds,
  onSelectionChange,
  title = "Select Lifts to Avoid",
  maxHeight = 300,
}) => {
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLifts();
  }, [resortId]);

  const loadLifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedLifts = await fetchResortLifts(resortId);
      setLifts(fetchedLifts);
    } catch (err: any) {
      setError(err.message || "Failed to load chairlifts");
      Alert.alert("Error", err.message || "Failed to load chairlifts");
    } finally {
      setLoading(false);
    }
  };

  const toggleLiftSelection = (liftId: number) => {
    console.log(
      "Toggle lift selection:",
      liftId,
      "Currently selected:",
      selectedLiftIds
    );
    const isSelected = selectedLiftIds.includes(liftId);
    let newSelection: number[];

    if (isSelected) {
      newSelection = selectedLiftIds.filter((id) => id !== liftId);
    } else {
      newSelection = [...selectedLiftIds, liftId];
    }

    console.log("New selection:", newSelection);
    onSelectionChange(newSelection);
  };

  const formatLiftType = (liftType: string): string => {
    // Check if the lift type follows the pattern "xp" where x is a number
    const match = liftType.match(/^(\d+)p$/i);
    if (match) {
      const personCount = match[1];
      return `${personCount} person`;
    }

    // Return the original lift type if it doesn't match the pattern
    return liftType;
  };

  const renderCheckbox = (isSelected: boolean) => (
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && (
        <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
      )}
    </View>
  );

  const renderLiftItem = (lift: Lift) => {
    const isSelected = selectedLiftIds.includes(lift.id);

    return (
      <TouchableOpacity
        key={lift.id}
        style={[styles.liftItem, isSelected && styles.liftItemSelected]}
        onPress={() => {
          console.log("TouchableOpacity pressed for lift:", lift.id, lift.name);
          toggleLiftSelection(lift.id);
        }}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        {renderCheckbox(isSelected)}
        <View style={styles.liftInfo}>
          <Text style={styles.liftName}>{lift.name}</Text>
          <Text style={styles.liftType}>{formatLiftType(lift.lift_type)}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.estimatedTime}>
            {lift.estimated_time_minutes}min
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading chairlifts...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLifts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {selectedLiftIds.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionText}>
            {selectedLiftIds.length} lift
            {selectedLiftIds.length !== 1 ? "s" : ""} selected to avoid
          </Text>
          <TouchableOpacity
            onPress={() => onSelectionChange([])}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={[styles.scrollView, { maxHeight }]}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {lifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No chairlifts found for this resort
            </Text>
          </View>
        ) : (
          lifts.map(renderLiftItem)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  selectionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.sm,
  },
  selectionText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  clearButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  clearButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  scrollView: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  liftItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  liftItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`, // 15% opacity
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radii.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.textPrimary,
  },
  liftInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  liftName: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  liftType: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  estimatedTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.sm,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default ChairliftSelector;
