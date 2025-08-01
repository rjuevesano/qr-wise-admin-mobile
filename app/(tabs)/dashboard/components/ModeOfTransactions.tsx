import { format } from 'date-fns';
import { router } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';

type SourceType = 'DINER' | 'KIOSK' | 'SERVICE';

export default function ModeOfTransactions({
  date,
  refreshing,
}: {
  date: Date;
  refreshing: boolean;
}) {
  const dateToday = useMemo(() => new Date(date), [date]);
  const { data: transactions, refetch: refetchTransactions } =
    useTransactionsQuery(
      {
        status: 'SUCCESS',
        date: dateToday,
      },
      'total-sales',
    );

  useEffect(() => {
    if (refreshing) {
      refetchTransactions?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

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

  const updatedTransactions = transactions || [];
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
    <TouchableOpacity
      onPress={() =>
        router.push(`/mode-of-transactions?date=${format(date, 'yyyy-MM-dd')}`)
      }
      className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
      <Text className="text-default-secondary font-OnestMedium text-xs">
        Mode of Transaction
      </Text>
      <Text className="text-default-primary mt-2 font-OnestSemiBold text-2xl">
        {getPercentage(sourceTotals[topSource])}%{' '}
        {(transactions || []).length > 0 ? sourceLabels[topSource] : ''}
      </Text>
      <Text className="text-default-secondary font-OnestRegular text-xs">
        {countToday} transactions
      </Text>
      <View className="absolute right-3 top-3">
        <ChevronRightIcon color="#FFFFFF" />
      </View>
      <View className="absolute bottom-0 right-0">
        <Svg width="146" height="91" viewBox="0 0 146 91" fill="none">
          <Path
            d="M146 73C146 113.317 113.317 146 73 146C32.6832 146 0 113.317 0 73C0 32.6832 32.6832 0 73 0C113.317 0 146 32.6832 146 73ZM54.75 73C54.75 83.0792 62.9208 91.25 73 91.25C83.0792 91.25 91.25 83.0792 91.25 73C91.25 62.9208 83.0792 54.75 73 54.75C62.9208 54.75 54.75 62.9208 54.75 73Z"
            fill="#373A41"
          />
          <Path
            d="M103.696 6.76749C105.5 7.60338 107.268 8.51258 108.998 9.49283L81.9994 57.1232C81.5671 56.8781 81.1249 56.6508 80.674 56.4419L103.696 6.76749Z"
            fill="#C2F93A"
          />
          <Path
            d="M109.001 9.49445C124.327 18.1831 135.995 32.1216 141.85 48.7383C147.706 65.3551 147.354 83.5289 140.86 99.9068L89.9651 79.7267C91.5885 75.6322 91.6765 71.0888 90.2126 66.9346C88.7487 62.7804 85.8319 59.2958 82.0002 57.1236L109.001 9.49445Z"
            fill="#9CDF03"
          />
          <Path
            d="M140.854 99.9233C135.461 113.514 126.112 125.172 114.016 133.388C101.921 141.603 87.637 145.997 73.0154 146C58.3939 146.003 44.1083 141.615 32.0094 133.405C19.9106 125.195 10.556 113.541 5.15763 99.952C-0.240743 86.3635 -1.43413 71.467 1.73206 57.1924C4.89826 42.9177 12.2781 29.9228 22.9156 19.8911C33.5531 9.85944 46.9579 3.25332 61.3935 0.928586C75.8291 -1.39615 90.6301 0.667647 103.879 6.8526L80.7198 56.4632C77.4075 54.9169 73.7073 54.401 70.0984 54.9821C66.4895 55.5633 63.1383 57.2149 60.4789 59.7228C57.8195 62.2307 55.9746 65.4794 55.183 69.0481C54.3915 72.6168 54.6898 76.3409 56.0394 79.738C57.389 83.1351 59.7276 86.0487 62.7524 88.1013C65.7771 90.1538 69.3485 91.2508 73.0039 91.25C76.6593 91.2492 80.2302 90.1508 83.254 88.0969C86.2779 86.0431 88.6153 83.1285 89.9634 79.7308L140.854 99.9233Z"
            fill="#78B300"
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}
