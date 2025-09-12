import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { Layout, Text, Button, Divider, TopNavigation, TopNavigationAction, Icon, IconProps, IconElement, Card, useTheme } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getRequest, Request } from '@/utils/data/VerificationController';

const BackIcon = (props : IconProps) : IconElement => <Icon {...props} name="ArrowLeft" />;

const getStatus = (status : number) => {
  switch (status) {
    case 0:
      return "warning";
      break;
    case 1:
      return "success";
      break;
    case 2:
      return "danger";
      break;

  }
}

export default function VerificationDetails() {
  const router = useRouter();
  const theme = useTheme();
  const {id : id} = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<Request>({} as Request);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getVerificationRequest = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getRequest(token ?? "", id as string);

      setRequest(((response as any).data));
    } catch (error) {
      console.error("Error getting request: ", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getVerificationRequest();

      return () => {
        console.log('Verification Request not focused');
      }
    }, [])
  )

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  return (
    <Layout style={styles.container} level="1">
        <SafeAreaView style={styles.container}>
            <TopNavigation
                title="Verification Details"
                alignment="center"
                accessoryLeft={renderBackAction}
            />

            <ScrollView style={{padding: 20}}>
                <Card status={getStatus(request.status)}>

                  <Text>Your application for verification is <Text category='s1'>{request.status > 0 ? request.status > 1 ? "Rejected." : "Approved." : "Pending."}</Text></Text>
                  {request.status === 0 && <Text category='c2' style={{paddingVertical: 10}}>Reason/s: <Text category='c1'>{request.message}</Text></Text>}
                  
                </Card>
                
                <View style={styles.rowBetween}>
                  <Text category="s1">Government ID</Text>
                  <Text style={styles.value}>{request.governmentIdType}</Text>
                </View>
                <Image source={{ uri: request.governmentIdImageUrl }} style={[styles.image, {backgroundColor: theme['color-basic-200']}]} />
                <Text category="s1" style={{ marginTop: 30 }}>Business Permit</Text>
                <Image source={{ uri: request.businessPermitPdfUrl }} style={[styles.image, {backgroundColor: theme['color-basic-200']}]} />
            </ScrollView>
            
        </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30
  },
});
