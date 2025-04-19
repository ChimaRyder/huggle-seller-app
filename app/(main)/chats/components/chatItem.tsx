import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Text, Icon, IconElement, IconProps } from '@ui-kitten/components';
import { useRouter } from 'expo-router';

export interface ChatItemProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar?: string;
}

const TimeIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="clock-outline" pack="eva" />
);

export const ChatItem = (props: ChatItemProps): React.ReactElement => {
  const { id, name, lastMessage, time, unreadCount, avatar } = props;
  const router = useRouter();

  const navigateToChat = () => {
    router.push('/(main)/chats/messageScreen');
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={navigateToChat}
      activeOpacity={0.7}
    >
      <Avatar
        source={avatar ? { uri: avatar } : require('../../../../assets/images/icon.png')}
        size="large"
        style={styles.avatar}
      />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text category="s1" style={styles.name}>{name}</Text>
            {unreadCount && unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text category="c2" style={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.timeContainer}>
            <Icon
              style={styles.timeIcon}
              fill="#8F9BB3"
              name="clock-outline"
              pack="eva"
              width={12}
              height={12}
            />
            <Text category="c1" appearance="hint">{time}</Text>
          </View>
        </View>
        <Text
          category="p2"
          appearance="hint"
          numberOfLines={1}
          style={styles.lastMessage}
        >
          {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  avatar: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  lastMessage: {
    color: '#8F9BB3',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#548C2F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
});

export default ChatItem;