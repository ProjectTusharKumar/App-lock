import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PinKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function KeypadButton({
  value,
  onPress,
  children,
}: {
  value: string;
  onPress: (value: string) => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    onPress(value);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.key,
        { backgroundColor: theme.backgroundSecondary },
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function PinKeypad({
  onKeyPress,
  onDelete,
  onBiometric,
  showBiometric = false,
}: PinKeypadProps) {
  const { theme } = useTheme();

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [showBiometric ? "bio" : "", "0", "del"],
  ];

  const renderKey = (key: string) => {
    if (key === "") {
      return <View style={styles.key} key="empty" />;
    }

    if (key === "del") {
      return (
        <KeypadButton key="del" value="del" onPress={onDelete}>
          <Feather name="delete" size={24} color={theme.text} />
        </KeypadButton>
      );
    }

    if (key === "bio") {
      return (
        <KeypadButton key="bio" value="bio" onPress={() => onBiometric?.()}>
          <Feather name="smartphone" size={24} color={theme.primary} />
        </KeypadButton>
      );
    }

    return (
      <KeypadButton key={key} value={key} onPress={onKeyPress}>
        <ThemedText type="h3">{key}</ThemedText>
      </KeypadButton>
    );
  };

  return (
    <View style={styles.container}>
      {keys.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(renderKey)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
  },
});
