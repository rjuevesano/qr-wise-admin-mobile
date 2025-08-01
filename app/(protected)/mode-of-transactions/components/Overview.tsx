import { Text, View } from 'react-native';
import { Transaction } from '~/types';

type SourceType = 'DINER' | 'KIOSK' | 'SERVICE';

export default function Overview({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const sourceTotals: Record<SourceType, number> = {
    DINER: 0,
    KIOSK: 0,
    SERVICE: 0,
  };

  const sourceCounts: Record<SourceType, number> = {
    DINER: 0,
    KIOSK: 0,
    SERVICE: 0,
  };

  const sourceLabels: Record<SourceType, string> = {
    DINER: 'Table QR',
    KIOSK: 'Self-Ordering',
    SERVICE: 'Counter',
  };

  const updatedTransactions = transactions;
  updatedTransactions.forEach((tx) => {
    sourceTotals[tx.source as SourceType] += tx.amount;
    sourceCounts[tx.source as SourceType] += 1;
  });

  const totalAmount = Object.values(sourceTotals).reduce(
    (sum, val) => sum + val,
    0,
  );
  const countToday = (updatedTransactions || []).length;
  const topSource = Object.entries(sourceTotals).reduce((max, curr) =>
    curr[1] > max[1] ? curr : max,
  )[0] as SourceType;

  const getPercentage = (value: number) =>
    totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(2) : '0.00';

  return (
    <View className="gap-1">
      <Text className="text-default-tertiary font-OnestSemiBold text-2xl">
        Mode of Transaction
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-default-primary font-OnestSemiBold text-2xl">
          {getPercentage(sourceTotals[topSource])}%{' '}
          {(transactions || []).length > 0 ? sourceLabels[topSource] : ''}
        </Text>
        <Text className="text-default-secondary font-OnestRegular text-sm">
          {countToday} transactions
        </Text>
      </View>
    </View>
  );
}
