import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Layout, Text, Button, ListItem, Divider, TopNavigation, TopNavigationAction, Icon, IconProps } from '@ui-kitten/components';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Request, getRequests } from '@/utils/data/VerificationController';

const BackIcon = (props: IconProps) => <Icon {...props} name="ArrowLeft" />;

export default function StoreVerificationIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Array<Request>>({} as Request[]);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getVerificationRequests = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getRequests(token ?? "", user?.id as string);

      setRequests(((response as any).data));
    } catch (error) {
      console.error("Error getting requests: ", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getVerificationRequests();

      return () => {
        console.log('Verification Requests not focused');
      }
    }, [])
  )

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  const renderItem = ({ item, index }: { item: Request, index: number }) => (
    <ListItem
      title={`Request #${index + 1}`}
      description={`Date Requested: ${new Date(item.createdAt).toLocaleString('en-PH', {month: "short", day: "numeric", year: "numeric"})}`}
      onPress={() => router.push(`/profile/storeVerification/verificationDetails?id=${item.id}`)}
    />
  );

  return (
    <Layout style={styles.container} level="1">
      
        <SafeAreaView style={styles.container}>
            <TopNavigation
                title="Store Verification Requests"
                alignment="center"
                accessoryLeft={renderBackAction}
            />

            <View style={{flex: 1, padding: 20}}>
                <FlatList
                    refreshing={loading}
                    onRefresh={getVerificationRequests}
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={Divider}
                    style={styles.list}
                />
                <Button style={styles.button} onPress={() => router.push('/profile/storeVerification/createVerificationRequest')}>Create Verification Request</Button>
            </View>
        </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
