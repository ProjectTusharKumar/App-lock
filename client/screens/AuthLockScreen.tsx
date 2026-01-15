import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { LockIcon } from "@/components/LockIcon";
import { PinDots } from "@/components/PinDots";
import { PinKeypad } from "@/components/PinKeypad";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { verifyPin, getAuthConfig, addIntruderLog } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;

export default function AuthLockScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { data: authConfig } = useQuery({
    queryKey: ["authConfig"],
    queryFn: getAuthConfig,
  });

  useEffect(() => {
    checkBiometric();
  }, []);

  useEffect(() => {
    if (lockTime > 0) {
      const timer = setTimeout(() => {
        setLockTime(lockTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTime === 0) {
      setIsLocked(false);
    }
  }, [lockTime, isLocked]);

  const checkBiometric = async () => {
    if (Platform.OS === "web") {
      setBiometricAvailable(false);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(hasHardware && isEnrolled);
  };

  const handleSuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAttempts(0);
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  }, [navigation]);

  const handleFailure = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    if (newAttempts >= MAX_ATTEMPTS) {
      addIntruderLog({
        timestamp: Date.now(),
        failedAttempts: newAttempts,
      });
      queryClient.invalidateQueries({ queryKey: ["intruderLogs"] });

      const lockDuration = Math.min(30 * Math.pow(2, Math.floor(newAttempts / MAX_ATTEMPTS) - 1), 3600);
      setLockTime(lockDuration);
      setIsLocked(true);
    }

    setTimeout(() => {
      setPin("");
      setError(false);
    }, 500);
  }, [attempts, queryClient]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isLocked || pin.length >= PIN_LENGTH) return;

      const newPin = pin + key;
      setPin(newPin);
      setError(false);

      if (newPin.length === PIN_LENGTH) {
        setTimeout(async () => {
          const isValid = await verifyPin(newPin);
          if (isValid) {
            handleSuccess();
          } else {
            handleFailure();
          }
        }, 100);
      }
    },
    [pin, isLocked, handleSuccess, handleFailure]
  );

  const handleDelete = useCallback(() => {
    if (!isLocked) {
      setPin((prev) => prev.slice(0, -1));
      setError(false);
    }
  }, [isLocked]);

  const handleBiometric = useCallback(async () => {
    if (Platform.OS === "web" || isLocked) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock App Lock",
      fallbackLabel: "Use PIN",
      disableDeviceFallback: false,
    });

    if (result.success) {
      handleSuccess();
    }
  }, [isLocked, handleSuccess]);

  const formatLockTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <LockIcon isLocked={true} size={80} />
        <ThemedText type="h3" style={styles.title}>
          App Lock
        </ThemedText>
        {isLocked ? (
          <ThemedText type="body" style={[styles.subtitle, { color: theme.error }]}>
            Too many attempts. Try again in {formatLockTime(lockTime)}
          </ThemedText>
        ) : (
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter your PIN to unlock
          </ThemedText>
        )}
      </View>

      <View style={styles.dotsContainer}>
        <PinDots length={PIN_LENGTH} filled={pin.length} error={error} />
      </View>

      {attempts > 0 && attempts < MAX_ATTEMPTS ? (
        <ThemedText type="small" style={[styles.attemptsText, { color: theme.warning }]}>
          {MAX_ATTEMPTS - attempts} attempts remaining
        </ThemedText>
      ) : null}

      <View style={styles.keypadContainer}>
        <PinKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onBiometric={handleBiometric}
          showBiometric={biometricAvailable && authConfig?.biometricEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  title: {
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  dotsContainer: {
    marginTop: Spacing["2xl"],
  },
  attemptsText: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
