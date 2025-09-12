import { FlatList, StyleSheet, View } from "react-native";
import { Icon, IconProps, IconElement, Layout, TopNavigation, TopNavigationAction, Text, useTheme } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Notification, getNotifications, markRead } from "@/utils/data/NotificationsController";
import NotificationItem from "./components/notificationItem";
import { CookingPot } from "lucide-react-native";

const BackIcon = (props : IconProps) : IconElement => (
    <Icon {...props} name={"ArrowLeft"}/>
)

const renderItem = ({item} : {item:Notification}) => (
    <NotificationItem key={item.id} notif={item}/>
)

const NotificationScreen = () => {
    const router = useRouter();
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { getToken } = useAuth();
    const { user } = useUser();

    const getAllNotifs = async () => {
        try {
            setLoading(true);
            const token = await getToken({template: "seller_app"});
            const response = await getNotifications(token ?? "", user?.id as string);

            setNotifications((response as any).data);
        } catch (error) {
            console.error("Error getting notifications: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleBack = async () => {
        try {
            const token = await getToken({template: "seller_app"});
            const response = await markRead(token ?? "", user?.id as string);

            router.back();
        } catch (error) {
            console.error("Error updating notifications: ", error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            getAllNotifs();

            return () => {
                console.log("Notifs not focused")
            }
        }, [])
    )

    const renderLeftActions = () => (
        <TopNavigationAction icon={BackIcon} onPress={handleBack}/>
    )

    return (
        <Layout style={styles.container}>
            <SafeAreaView style={styles.container}>
                <TopNavigation
                title={"Notifications"}
                accessoryLeft={renderLeftActions}
                alignment="center"
                />

                <FlatList
                    refreshing={loading}
                    onRefresh={getAllNotifs}
                    data={notifications}
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.noNotifs}>
                            <CookingPot size={40} color={theme['color-basic-600']}/>
                            <Text category="h6" appearance="hint">No Notifications</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                />

            </SafeAreaView>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex : 1
    },
    noNotifs: {
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    list: {
        padding: 15
    }
})

export default NotificationScreen;