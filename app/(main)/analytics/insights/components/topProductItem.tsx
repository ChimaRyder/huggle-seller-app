import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Eye, ShoppingBag, ShoppingCart } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface TopProductItemProps {
  item: {
    productId: string;
    productName: string;
    views: number;
    cartAdds: number;
    purchases: number;
    engagementScore: number;
  };
  index: number;
}

const TopProductItem: React.FC<TopProductItemProps> = ({ item, index }) => {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: colors.warning + '20', borderColor: colors.warning };
    if (rank === 2) return { backgroundColor: colors.info + '20', borderColor: colors.info };
    if (rank === 3) return { backgroundColor: colors.success + '20', borderColor: colors.success };
    return { backgroundColor: colors.background.secondary, borderColor: colors.border.primary };
  };

  const rankStyle = getRankStyle(index + 1);

  return (
    <View style={styles.container}>
      <View style={[styles.rankBadge, rankStyle]}>
        <Text style={styles.rank}>{index + 1}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eye size={14} color={colors.info} />
            <Text style={styles.statValue}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <ShoppingCart size={14} color={colors.warning} />
            <Text style={styles.statValue}>{item.cartAdds}</Text>
          </View>
          <View style={styles.statItem}>
            <ShoppingBag size={14} color={colors.success} />
            <Text style={styles.statValue}>{item.purchases}</Text>
          </View>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{item.engagementScore.toFixed(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rank: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingLeft: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
});

export default TopProductItem; 