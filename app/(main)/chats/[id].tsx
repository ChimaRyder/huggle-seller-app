import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isRead?: boolean;
}

interface Customer {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'Sarah Johnson',
    image: 'https://i.pravatar.cc/150?img=1',
    rating: 4.8,
    distance: 'Regular Customer'
  },
  {
    id: 'customer-2',
    name: 'Mike Chen',
    image: 'https://i.pravatar.cc/150?img=2',
    rating: 4.9,
    distance: 'VIP Customer'
  },
  {
    id: 'customer-3',
    name: 'Emily Davis',
    image: 'https://i.pravatar.cc/150?img=3',
    rating: 4.7,
    distance: 'New Customer'
  },
  {
    id: 'customer-4',
    name: 'Alex Rodriguez',
    image: 'https://i.pravatar.cc/150?img=4',
    rating: 4.6,
    distance: 'Regular Customer'
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Memoize the customer info to prevent unnecessary re-renders
  const customer = useMemo(() => {
    return mockCustomers.find(customer => customer.id === id) || null;
  }, [id]);

  // Generate mock conversation
  useEffect(() => {
    if (!customer) return;

    // Generate contextual messages based on customer type
    const isVipCustomer = customer.distance === 'VIP Customer';

    const mockMessages: Message[] = [
      {
        id: '1',
        text: `Hi! Welcome to our store. How can we help you today?`,
        timestamp: '10:30 AM',
        isFromUser: false,
        isRead: true,
      },
      {
        id: '2',
        text: isVipCustomer
          ? 'Hi! I wanted to ask about your premium organic selection.'
          : 'Hello! I saw your fresh produce and wanted to ask about availability.',
        timestamp: '10:32 AM',
        isFromUser: true,
        isRead: true,
      },
      {
        id: '3',
        text: isVipCustomer
          ? 'Great choice! As a VIP customer, you have access to our premium organic selection. We have fresh organic produce delivered daily. What are you looking for specifically?'
          : 'Thanks for your interest! We have fresh produce delivered daily. Our popular items include organic apples, leafy greens, and seasonal vegetables. What can we help you find?',
        timestamp: '10:33 AM',
        isFromUser: false,
        isRead: true,
      },
      {
        id: '4',
        text: isVipCustomer
          ? 'Perfect! Do you have any premium Honeycrisp apples available?'
          : 'I\'d love to try some fresh organic vegetables. What do you recommend?',
        timestamp: '10:35 AM',
        isFromUser: true,
        isRead: true,
      },
      {
        id: '5',
        text: isVipCustomer
          ? 'Yes! We have premium Honeycrisp apples at $4.99 per lb. They\'re exceptionally crisp and sweet. Would you like me to set some aside for you?'
          : 'I recommend our fresh organic spinach and bell peppers! They arrived this morning and are very fresh. Would you like to place an order?',
        timestamp: '10:36 AM',
        isFromUser: false,
        isRead: false,
      },
    ];

    setMessages(mockMessages);
  }, [customer]);

  // Keyboard event listeners for auto-scroll
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: false });
  }, []);

  const handleSendMessage = useCallback(() => {
    if (message.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: false,
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate customer response after 2 seconds
    setTimeout(() => {
      const isVipCustomer = customer?.distance === 'VIP Customer';

      const responses = [
        "Thanks for your message! Let me check our current inventory for you.",
        "I'll verify what we have in stock and get back to you shortly.",
        "Great! I'll make sure to have that ready for pickup.",
        "Perfect! Is there anything else from our selection I can help you with?",
        "Let me check with our team about availability.",
        "I'll set that aside for you. When would you like to pick it up?",
      ];

      const customerResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)] || "Thanks for your message!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: true,
        isRead: false,
      };

      setMessages(prev => [...prev, customerResponse]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  }, [message, customer]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isFromUser ? styles.userMessageContainer : styles.storeMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isFromUser ? styles.userMessageBubble : styles.storeMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.storeMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isFromUser ? styles.userMessageTime : styles.storeMessageTime
        ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Image source={{ uri: customer.image }} style={styles.storeAvatar} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {customer.name}
              </Text>
              <Text style={styles.storeStatus}>Online</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={`Message ${customer?.name || 'customer'}...`}
              placeholderTextColor={colors.text.secondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim().length === 0 && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={message.trim().length === 0}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim().length > 0 ? colors.successDark : colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerBackButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  storeStatus: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    marginTop: 2,
  },
  headerAction: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  storeMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  storeMessageBubble: {
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: radii.xs,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  userMessageText: {
    color: colors.text.inverse,
  },
  storeMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  userMessageTime: {
    color: colors.text.inverse,
    opacity: 0.8,
    textAlign: 'right',
  },
  storeMessageTime: {
    color: colors.text.secondary,
  },
  inputContainer: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: 'transparent',
    borderRadius: radii.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});