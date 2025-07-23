import { StyleSheet } from "react-native";
import { Card, Text, Layout, useTheme} from "@ui-kitten/components";
import { Notification } from "@/utils/Controllers/NotificationsController.";
import { NotepadText } from "lucide-react-native";

const NotificationItem = ({ notif } : { notif : Notification }) => {
    const theme = useTheme();
    
    return (
        <Card appearance="filled" >
            <Layout style={styles.card}>
                <Layout level="1" style={styles.notifRow}>
                    {notif.type === 3 && <NotepadText size={35} color={theme['color-primary-500']}/>}
                    {notif.type === 4 && <NotepadText size={35} color={theme['color-danger-500']}/>}

                    <Layout style={styles.notifDetails}>
                        <Text category="s1">{notif.title}  {!notif.isRead && <Layout style={[styles.unreadBadge, {backgroundColor: theme['color-info-500']}]}/>}</Text>
                        <Text category="p2">{notif.message}</Text>
                        <Text category="c1" appearance="hint" style={styles.notifDate}>{new Date(notif.createdAt).toLocaleString('en-PH', {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}</Text>
                    </Layout>
                </Layout>
            </Layout>
            

        </Card>
    )
}


const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 20
    },
    notifRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    notifDetails: {
        gap: 5
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