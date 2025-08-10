import { format } from 'date-fns';
import { router } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Chart from '~/components/icons/Chart';
import useCurrentHour from '~/hooks/useCurrentHour';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import { makePluralize } from '~/lib/utils';

export default function Orders({
  date,
  refreshing,
}: {
  date: Date;
  refreshing: boolean;
}) {
  const currentHour = useCurrentHour();
  const dateToday = useMemo(() => new Date(date), [date]);

  const { data: transactions, refetch } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: dateToday,
    },
    'total-sales',
  );

  useEffect(() => {
    if (refreshing) {
      refetch?.();
    }
  }, [refreshing]);

  const recentTransactions = (transactions || []).filter((t) => {
    const createdAt = t.createdAt?.toDate?.();
    return createdAt.getHours() <= currentHour - 1;
  });

  const totalOrders =
    recentTransactions.reduce((sum, t) => sum + (t.orderIds?.length || 0), 0) ||
    0;

  const average = totalOrders / recentTransactions.length;
  const averageTotalOrders = Math.round(Math.round((average || 0) * 10) / 10);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/orders?date=${format(date, 'yyyy-MM-dd')}`)}
      className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
      <View className="absolute left-3 top-3 z-10">
        <Text className="font-OnestMedium text-xs text-default-secondary">
          Orders
        </Text>
        <Text className="mt-2 font-OnestSemiBold text-2xl text-default-primary">
          {averageTotalOrders} {makePluralize('orders', averageTotalOrders)}
        </Text>
        <Text className="font-OnestRegular text-xs text-default-secondary">
          average last hour
        </Text>
      </View>
      <View className="absolute right-3 top-3">
        <ChevronRightIcon color="#FFFFFF" />
      </View>
      <View className="mt-3 overflow-hidden">
        <Chart />
      </View>
    </TouchableOpacity>
  );
}
