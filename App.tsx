import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message
// LogBox.ignoreAllLogs(); //Ignore all log notifications
import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect } from "react";
import { EXPO_PUSH_TOKEN } from "./secrets";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    const configurePushNotifications = async () => {
      try {
        let settings = await Notifications.getPermissionsAsync();

        const isGranted = settings.granted;
        if (!isGranted) {
          settings = await Notifications.requestPermissionsAsync();
        }
        if (!isGranted) {
          Alert.alert(
            "Permission required",
            "Push notifications need the appropriate permissions."
          );
          return;
        }
        if (Constants.expoConfig?.extra) {
          const projectId = Constants.expoConfig.extra.eas.projectId;
          const pushTokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
              name: "default",
              importance: Notifications.AndroidImportance.DEFAULT,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscriptionOne = Notifications.addNotificationReceivedListener(
      (notification) => {
        const username = notification.request.content.data.userName;
      }
    );

    const subscriptionTwo =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const username = response.notification.request.content.data.userName;
      });

    return () => {
      subscriptionOne.remove();
      subscriptionTwo.remove();
    };
  }, []);

  const handleScheduleNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Notification Title",
        body: "Body of notification; the details",
        data: {
          userName: "UserNameHere",
        },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  const handleSendPushNotification = async () => {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: `${EXPO_PUSH_TOKEN}`,
        title: "Test - sent from a device!",
        body: "This is a test!",
      }),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        title="Schedule Notification"
        onPress={handleScheduleNotification}
      />
      <Button
        title="Send Push Notification"
        onPress={handleSendPushNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
