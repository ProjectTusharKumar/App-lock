import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface PinDotsProps {
  length: number;
  filled: number;
  error?: boolean;
}

function PinDot({ isFilled, error }: { isFilled: boolean; error?: boolean }) {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = isFilled
      ? withSpring(1, { damping: 15, stiffness: 200 })
      : withSpring(0.8, { damping: 15, stiffness: 200 });

    const translateX = error
      ? withSequence(
          withSpring(-5, { damping: 10, stiffness: 300 }),
          withSpring(5, { damping: 10, stiffness: 300 }),
          withSpring(-5, { damping: 10, stiffness: 300 }),
          withSpring(0, { damping: 10, stiffness: 300 })
        )
      : 0;

    return {
      transform: [{ scale }, { translateX }],
      backgroundColor: error
        ? theme.error
        : isFilled
          ? theme.primary
          : theme.backgroundSecondary,
    };
  }, [isFilled, error]);

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function PinDots({ length, filled, error }: PinDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <PinDot key={index} isFilled={index < filled} error={error} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Spacing["2xl"],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: Spacing.sm,
  },
});
