import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import IntruderLogsScreen from "@/screens/IntruderLogsScreen";
import AuthSetupScreen from "@/screens/AuthSetupScreen";
import AuthLockScreen from "@/screens/AuthLockScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { getAuthConfig } from "@/lib/storage";

export type RootStackParamList = {
  Main: undefined;
  IntruderLogs: undefined;
  AuthSetup: { mode: "setup" | "change" };
  AuthLock: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [isReady, setIsReady] = useState(false);

  const { data: authConfig, isLoading } = useQuery({
    queryKey: ["authConfig"],
    queryFn: getAuthConfig,
  });

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  if (!isReady) {
    return null;
  }

  const needsSetup = !authConfig?.isSetupComplete;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {needsSetup ? (
        <Stack.Screen
          name="AuthSetup"
          component={AuthSetupScreen}
          options={{
            headerTitle: "Set Up PIN",
            headerBackVisible: false,
            gestureEnabled: false,
          }}
          initialParams={{ mode: "setup" }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="IntruderLogs"
            component={IntruderLogsScreen}
            options={{
              headerTitle: "Intruder Logs",
            }}
          />
          <Stack.Screen
            name="AuthSetup"
            component={AuthSetupScreen}
            options={{
              headerTitle: "Change PIN",
              presentation: "modal",
            }}
            initialParams={{ mode: "change" }}
          />
          <Stack.Screen
            name="AuthLock"
            component={AuthLockScreen}
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
