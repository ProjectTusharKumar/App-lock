import React, { useState, useCallback } from "react";
import { StyleSheet, View, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { PinDots } from "@/components/PinDots";
import { PinKeypad } from "@/components/PinKeypad";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { setupPin, verifyPin } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "AuthSetup">;

const PIN_LENGTH = 6;

export default function AuthSetupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const queryClient = useQueryClient();

  const mode = route.params?.mode || "setup";
  const [step, setStep] = useState<"current" | "enter" | "confirm">(
    mode === "change" ? "current" : "enter"
  );
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState(false);

  const setupMutation = useMutation({
    mutationFn: setupPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authConfig"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const getTitle = () => {
    if (step === "current") return "Enter Current PIN";
    if (step === "enter") return mode === "change" ? "Enter New PIN" : "Create PIN";
    return "Confirm PIN";
  };

  const getSubtitle = () => {
    if (step === "current") return "Enter your current PIN to continue";
    if (step === "enter")
      return mode === "change"
        ? "Choose a new 6-digit PIN"
        : "Choose a 6-digit PIN to protect your apps";
    return "Re-enter your PIN to confirm";
  };

  const currentPin = step === "confirm" ? confirmPin : pin;

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentPin.length >= PIN_LENGTH) return;

      const newPin = currentPin + key;
      setError(false);

      if (step === "confirm") {
        setConfirmPin(newPin);
      } else {
        setPin(newPin);
      }

      if (newPin.length === PIN_LENGTH) {
        setTimeout(async () => {
          if (step === "current") {
            const isValid = await verifyPin(newPin);
            if (isValid) {
              setPin("");
              setStep("enter");
            } else {
              setError(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              setTimeout(() => {
                setPin("");
                setError(false);
              }, 500);
            }
          } else if (step === "enter") {
            setStep("confirm");
          } else if (step === "confirm") {
            if (newPin === pin) {
              setupMutation.mutate(newPin);
            } else {
              setError(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("PINs Don't Match", "Please try again", [
                {
                  text: "OK",
                  onPress: () => {
                    setConfirmPin("");
                    setStep("enter");
                    setPin("");
                    setError(false);
                  },
                },
              ]);
            }
          }
        }, 100);
      }
    },
    [currentPin, step, pin, setupMutation]
  );

  const handleDelete = useCallback(() => {
    if (step === "confirm") {
      setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
    setError(false);
  }, [step]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/authentication-success.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <ThemedText type="h3" style={styles.title}>
          {getTitle()}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {getSubtitle()}
        </ThemedText>
      </View>

      <View style={styles.dotsContainer}>
        <PinDots length={PIN_LENGTH} filled={currentPin.length} error={error} />
      </View>

      <View style={styles.keypadContainer}>
        <PinKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
      </View>

      {step === "confirm" ? (
        <View style={styles.backContainer}>
          <ThemedText
            type="body"
            style={[styles.backButton, { color: theme.primary }]}
            onPress={() => {
              setStep("enter");
              setConfirmPin("");
            }}
          >
            Go back
          </ThemedText>
        </View>
      ) : null}
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
  icon: {
    width: 80,
    height: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  dotsContainer: {
    marginTop: Spacing["3xl"],
  },
  keypadContainer: {
    flex: 1,
    justifyContent: "center",
  },
  backContainer: {
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  backButton: {
    fontWeight: "600",
  },
});
