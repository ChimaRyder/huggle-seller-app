import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
  Shield,
  User,
  Camera,
  Download,
  RefreshCw,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getRequest, Request } from '@/utils/data/VerificationController';

const { width } = Dimensions.get('window');

const getStatusConfig = (status: number) => {
  switch (status) {
    case 0: return {
      text: 'Pending',
      color: colors.warning,
      bgColor: colors.background.warningSubtle,
      icon: Clock,
      description: 'Your verification request is in the queue for review'
    };
    case 1: return {
      text: 'Processing',
      color: colors.info,
      bgColor: colors.background.infoSubtle,
      icon: Eye,
      description: 'Our team is currently reviewing your documents'
    };
    case 2: return {
      text: 'Approved',
      color: colors.success,
      bgColor: colors.background.successSubtle,
      icon: CheckCircle,
      description: 'Congratulations! Your verification has been approved'
    };
    case 3: return {
      text: 'Rejected',
      color: colors.error,
      bgColor: colors.background.errorSubtle,
      icon: XCircle,
      description: 'Your verification request was not approved'
    };
    default: return {
      text: 'Unknown',
      color: colors.text.tertiary,
      bgColor: colors.background.secondary,
      icon: AlertTriangle,
      description: 'Status information is not available'
    };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function VerificationDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getVerificationRequest = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await getToken({ template: "seller_app" });
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      const response = await getRequest(token ?? "", id as string);

      setRequest((response as any).data);
    } catch (error) {
      console.error("Error getting request: ", error);
      setRequest(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    await getVerificationRequest(true);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      getVerificationRequest();
    }, [id])
  );

  if (loading && !request) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Verification Details</Text>
            <Text style={styles.headerSubtitle}>Loading request information</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <RefreshCw size={24} color={colors.primary} />
          <Text style={styles.loadingText}>Loading verification details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Verification Details</Text>
            <Text style={styles.headerSubtitle}>Request not found</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <XCircle size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Request Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The verification request you're looking for could not be found.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => getVerificationRequest()}>
            <RefreshCw size={20} color={colors.text.inverse} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verification Details</Text>
          <Text style={styles.headerSubtitle}>Request #{request.id.split('-')[1]}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: statusConfig.color }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={24} color={statusConfig.color} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
              <Text style={styles.statusDescription}>
                {statusConfig.description}
              </Text>
            </View>
          </View>

          {request.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{request.message}</Text>
            </View>
          )}
        </View>

        {/* Request Information */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Request Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <FileText size={16} color={colors.text.secondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Request ID</Text>
                <Text style={styles.infoValue}>#{request.id.split('-')[1]}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={16} color={colors.text.secondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Submitted</Text>
                <Text style={styles.infoValue}>{formatDate(request.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={16} color={colors.text.secondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDate(request.updatedAt)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <User size={16} color={colors.text.secondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID Type</Text>
                <Text style={styles.infoValue}>{request.governmentIdType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Government ID Section */}
        <View style={styles.documentCard}>
          <View style={styles.cardHeader}>
            <Camera size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Government ID</Text>
          </View>
          <Text style={styles.documentDescription}>
            {request.governmentIdType} submitted for verification
          </Text>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: request.governmentIdImageUrl }}
              style={styles.documentImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>{request.governmentIdType}</Text>
            </View>
          </View>
        </View>

        {/* Business Permit Section */}
        <View style={styles.documentCard}>
          <View style={styles.cardHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Business Permit</Text>
          </View>
          <Text style={styles.documentDescription}>
            Business registration document for verification
          </Text>

          <View style={styles.pdfContainer}>
            <View style={styles.pdfIcon}>
              <FileText size={32} color={colors.primary} />
            </View>
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfTitle}>Business Permit Document</Text>
              <Text style={styles.pdfSubtitle}>PDF Document</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline/Next Steps */}
        <View style={styles.timelineCard}>
          <View style={styles.cardHeader}>
            <Clock size={20} color={colors.info} />
            <Text style={styles.cardTitle}>What happens next?</Text>
          </View>

          <View style={styles.timelineList}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: colors.background.successSubtle }]}>
                <CheckCircle size={16} color={colors.success} />
              </View>
              <Text style={styles.timelineText}>Documents submitted successfully</Text>
            </View>

            <View style={styles.timelineItem}>
              <View style={[
                styles.timelineIcon,
                { backgroundColor: request.status >= 1 ? colors.background.successSubtle : colors.background.warningSubtle }
              ]}>
                <Eye size={16} color={request.status >= 1 ? colors.success : colors.warning} />
              </View>
              <Text style={styles.timelineText}>Review by verification team</Text>
            </View>

            <View style={styles.timelineItem}>
              <View style={[
                styles.timelineIcon,
                { backgroundColor: request.status >= 2 ? colors.background.successSubtle : colors.background.secondary }
              ]}>
                <Shield size={16} color={request.status >= 2 ? colors.success : colors.text.tertiary} />
              </View>
              <Text style={styles.timelineText}>Verification complete</Text>
            </View>
          </View>

          {request.status < 2 && (
            <View style={styles.estimateContainer}>
              <Text style={styles.estimateText}>
                ⏱️ Estimated processing time: 3-5 business days
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  refreshButton: {
    backgroundColor: colors.background.successSubtle,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },

  // Status Card
  statusCard: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  statusDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  messageContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  messageLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Cards
  infoCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
  },
  documentCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
  },
  timelineCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },

  // Info Grid
  infoGrid: {
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },

  // Document sections
  documentDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  documentImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.secondary,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  imageOverlayText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // PDF Container
  pdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  pdfIcon: {
    width: 56,
    height: 56,
    backgroundColor: colors.background.successSubtle,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pdfSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  downloadButton: {
    padding: spacing.sm,
  },

  // Timeline
  timelineList: {
    gap: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  estimateContainer: {
    backgroundColor: colors.background.infoSubtle,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  estimateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
