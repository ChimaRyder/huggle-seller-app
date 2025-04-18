import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Icon, Input, Divider } from '@ui-kitten/components';
import { IconProps, IconElement } from '@ui-kitten/components';
import { ChatItem, ChatItemProps } from './chats/components/chatItem';

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bell-outline" pack="eva" />
);

const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);

const FilterIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="options-2-outline" pack="eva" />
);

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItemProps[]>([
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hi there! I\'m interested in your product.',
      time: '10:30 AM',
      unreadCount: 3,
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'When will my order be shipped?',
      time: 'Yesterday',
      unreadCount: 1,
    },
    {
      id: '3',
      name: 'Robert Johnson',
      lastMessage: 'Thanks for the quick delivery!',
      time: 'Yesterday',
    },
    {
      id: '4',
      name: 'Emily Davis',
      lastMessage: 'Do you have this in other colors?',
      time: 'Monday',
    },
    {
      id: '5',
      name: 'Michael Wilson',
      lastMessage: 'I\'d like to place a bulk order.',
      time: 'Monday',
    },
  ]);

  const renderRightActions = () => (
    <TopNavigationAction icon={BellIcon} />
  );

  const renderFilterIcon = (props: IconProps) => (
    <TouchableOpacity onPress={() => console.log('Filter pressed')}>
      <FilterIcon {...props} />
    </TouchableOpacity>
  );

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: ChatItemProps }) => (
    <ChatItem {...item} />
  );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={evaProps => <Text {...evaProps} category="h5">Chats</Text>}
        alignment="start"
        accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search conversations"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessoryLeft={SearchIcon}
          accessoryRight={renderFilterIcon}
          style={styles.searchInput}
        />
      </View>
      
      <Divider />
      
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon
            name="message-square-outline"
            fill="#8F9BB3"
            style={styles.emptyIcon}
            pack="eva"
          />
          <Text category="s1" appearance="hint">No conversations found</Text>
          <Text category="c1" appearance="hint" style={styles.emptySubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderRadius: 8,
    backgroundColor: '#F7F9FC',
  },
  chatList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptySubtext: {
    marginTop: 8,
  },
});
