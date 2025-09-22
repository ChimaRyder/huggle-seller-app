import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Eye,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { Request, getRequests } from '@/utils/data/VerificationController';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (spacing.lg * 2);

export default function StoreVerificationIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getVerificationRequests = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const userId = user?.id || "demo-user";

      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      const response = await getRequests(token ?? "", userId);
      const requestsData = (response as any).data || [];
      setRequests(requestsData);
    } catch (error) {
      console.error("Error getting verification requests: ", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getVerificationRequests();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getVerificationRequests();
    }, [])
  );

  const handleCreateRequest = () => {
    router.push('/profile/storeVerification/createVerificationRequest');
  };

  const handleRequestPress = (requestId: string) => {
    router.push(`/profile/storeVerification/verificationDetails?id=${requestId}`);
  };

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 0: return {
        text: 'Pending',
        color: colors.warning,
        bgColor: colors.background.warningSubtle,
        icon: Clock
      };
      case 1: return {
        text: 'Processing',
        color: colors.info,
        bgColor: colors.background.infoSubtle,
        icon: Eye
      };
      case 2: return {
        text: 'Approved',
        color: colors.success,
        bgColor: colors.background.successSubtle,
        icon: CheckCircle
      };
      case 3: return {
        text: 'Rejected',
        color: colors.error,
        bgColor: colors.background.errorSubtle,
        icon: XCircle
      };
      default: return {
        text: 'Unknown',
        color: colors.text.tertiary,
        bgColor: colors.background.secondary,
        icon: AlertTriangle
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
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getVerificationStats = () => {
    const pending = requests.filter(r => r.status === 0).length;
    const approved = requests.filter(r => r.status === 2).length;
    const processing = requests.filter(r => r.status === 1).length;
    return { pending, approved, processing, total: requests.length };
  };

  const renderStatsOverview = () => {
    if (requests.length === 0) return null;

    const stats = getVerificationStats();

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Verification Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.background.successSubtle }]}>
              <CheckCircle size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.background.infoSubtle }]}>
              <Eye size={20} color={colors.info} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.processing}</Text>
              <Text style={styles.statLabel}>Processing</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.background.warningSubtle }]}>
              <Clock size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.background.secondary }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Requests</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRequestCard = ({ item }: { item: Request }) => {
    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => handleRequestPress(item.id)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={14} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
            <Text style={styles.requestDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Government ID Preview */}
        <View style={styles.idPreviewContainer}>
          <Image
            source={{ uri: item.governmentIdImageUrl }}
            style={styles.idPreview}
            resizeMode="cover"
          />
          <View style={styles.idTypeOverlay}>
            <Text style={styles.idTypeText}>{item.governmentIdType}</Text>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.requestInfo}>
            <View style={styles.infoRow}>
              <FileText size={16} color={colors.text.secondary} />
              <Text style={styles.requestId}>Request #{item.id.split('-')[1]}</Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={16} color={colors.text.secondary} />
              <Text style={styles.submissionDate}>
                Submitted {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <Text style={styles.requestMessage} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Shield size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Verification Requests</Text>
      <Text style={styles.emptySubtitle}>
        Start the verification process to unlock full seller features and build trust with customers.
      </Text>
      <TouchableOpacity style={styles.createFirstRequestButton} onPress={handleCreateRequest}>
        <Plus size={20} color={colors.text.inverse} />
        <Text style={styles.createFirstRequestText}>Create Your First Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Store Verification</Text>
          <Text style={styles.headerSubtitle}>Manage your verification requests</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRequest}>
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={renderStatsOverview}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && { flex: 1 },
          { paddingBottom: insets.bottom + spacing.xl }
        ]}
      />
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
  createButton: {
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
  listContent: {
    // paddingBottom handled dynamically with safe area insets
  },

  // Stats Card
  statsCard: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },

  // Request Card
  requestCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  requestDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },

  // ID Preview
  idPreviewContainer: {
    position: 'relative',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  idPreview: {
    width: '100%',
    height: 120,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
  },
  idTypeOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  idTypeText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Card Content
  cardContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  requestInfo: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  requestId: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  submissionDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  requestMessage: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    color: colors.text.secondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  createFirstRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  createFirstRequestText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
});
