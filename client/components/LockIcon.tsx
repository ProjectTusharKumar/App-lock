import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";

interface LockIconProps {
  isLocked: boolean;
  size?: number;
  animating?: boolean;
}

export function LockIcon({ isLocked, size = 120, animating = false }: LockIconProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (animating) {
      rotation.value = withSequence(
        withTiming(isLocked ? 0 : 15, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(isLocked ? -5 : 20, { duration: 100, easing: Easing.inOut(Easing.ease) }),
            withTiming(isLocked ? 5 : 10, { duration: 100, easing: Easing.inOut(Easing.ease) })
          ),
          3,
          true
        ),
        withTiming(0, { duration: 200 })
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [isLocked, animating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const iconColor = isLocked ? theme.success : theme.textSecondary;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            width: size,
            height: size,
            backgroundColor: theme.backgroundSecondary,
          },
          animatedStyle,
        ]}
      >
        <Feather
          name={isLocked ? "lock" : "unlock"}
          size={size * 0.5}
          color={iconColor}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
