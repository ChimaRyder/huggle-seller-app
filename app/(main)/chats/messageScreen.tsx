import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { 
  Layout, 
  Text, 
  TopNavigation, 
  TopNavigationAction, 
  Icon, 
  Input, 
  Button, 
  Avatar,
  IconElement,
  IconProps
} from '@ui-kitten/components';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const SendIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="paper-plane-outline" pack="eva" />
);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export default function MessageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name } = params;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'other', timestamp: '10:00 AM' },
    { id: '2', text: 'I have a question about my order.', sender: 'user', timestamp: '10:02 AM' },
    { id: '3', text: 'Sure, I\'d be happy to help. What\'s your order number?', sender: 'other', timestamp: '10:03 AM' },
    { id: '4', text: 'It\'s #HG-1234567', sender: 'user', timestamp: '10:05 AM' },
    { id: '5', text: 'Thank you! Let me check that for you.', sender: 'other', timestamp: '10:06 AM' },
  ]);

  const navigateBack = () => {
    router.back();
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const renderTitle = (props: any) => (
    <View style={styles.titleContainer}>
      <Avatar 
        source={require('../../../assets/images/icon.png')} 
        size='small' 
        style={styles.avatar}
      />
      <Text {...props}>{name}</Text>
    </View>
  );

  const sendMessage = () => {
    if (message.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.otherBubble
      ]}>
        <Text style={item.sender === 'user' ? styles.userMessageText : styles.otherMessageText}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title={renderTitle}
        alignment="center"
        accessoryLeft={renderBackAction}
        style={styles.topNavigation}
      />
      
      <Layout style={styles.content}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      </Layout>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <Input
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          accessoryRight={(props) => (
            <Button
              appearance="ghost"
              accessoryLeft={SendIcon}
              onPress={sendMessage}
              style={styles.sendButton}
            />
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  topNavigation: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#3366FF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#EDF1F7',
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#222B45',
  },
  timestamp: {
    fontSize: 10,
    color: '#8F9BB3',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },
  input: {
    borderRadius: 24,
    backgroundColor: '#F7F9FC',
  },
  sendButton: {
    marginRight: -8,
  },
});
