import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message
// LogBox.ignoreAllLogs(); //Ignore all log notifications
import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
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
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification);
        const username = notification.request.content.data.userName;
        console.log(username);
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const permissionsHandler = async () => {
    const settings = await Notifications.getPermissionsAsync();

    const isGranted = settings.granted;
    if (isGranted) {
      Alert.alert(
        "Permission has already been granted!",
        "You can receive notifications"
      );
    } else {
      const request = await Notifications.requestPermissionsAsync();

      if (request.granted) {
        Alert.alert(
          "You have granted permissions",
          "You can now receive notifications"
        );
      } else {
        Alert.alert(
          "You did not grant permissions",
          "You will be unable to receive notifications"
        );
      }
    }
  };
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
      <View style={{ marginBottom: 20 }}>
        <Button title="Permissions" onPress={permissionsHandler} />
      </View>
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
