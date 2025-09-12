import { StyleSheet, View } from "react-native";
import { Card, Text, Layout, useTheme} from "@ui-kitten/components";
import { markRead, Notification } from "@/utils/data/NotificationsController";
import { NotepadText, NotepadTextDashed } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const NotificationItem = ({ notif } : { notif : Notification }) => {
    const theme = useTheme();
 
    return (
        <Card appearance="filled">
            <View style={styles.card}>
                <View style={styles.notifRow}>
                    {notif.type === 3 && <NotepadText size={35} color={theme['color-primary-500']}/>}
                    {notif.type === 4 && <NotepadTextDashed size={35} color={theme['color-danger-500']}/>}

                    <View style={styles.notifDetails}>
                        <Text category="s1">{notif.title}  {!notif.isRead && <Layout style={[styles.unreadBadge, {backgroundColor: theme['color-info-500']}]}/>}</Text>
                        <Text category="p2" style={{wordWrap: "break-word"}}>{notif.message}</Text>
                        <Text category="c1" appearance="hint" style={styles.notifDate}>{new Date(notif.createdAt).toLocaleString('en-PH', {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}</Text>
                    </View>
                </View>
            </View>
            

        </Card>
    )
}


const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 20,
    },
    notifRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    notifDetails: {
        gap: 5,
    },
    notifDate: {
        marginTop: 5
    },
    unreadBadge: {
        height: 10,
        width: 10,
        borderRadius: 100,
    }
})

export default NotificationItem;