import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message
// LogBox.ignoreAllLogs(); //Ignore all log notifications
import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect } from "react";

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
          console.log(pushTokenData);
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
        console.log("NOTIFICATION RECEIVED");
        const username = notification.request.content.data.userName;
      }
    );

    const subscriptionTwo =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        const username = response.notification.request.content.data.userName;
      });

    return () => {
      subscriptionOne.remove();
      subscriptionTwo.remove();
    };
  }, []);

  const scheduleNotificationHandler = () => {
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
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
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
