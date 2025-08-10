import { format, isToday, subDays } from 'date-fns';
import { router } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Chart from '~/components/icons/Chart';
import useCurrentHour from '~/hooks/useCurrentHour';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import { formatPrice } from '~/lib/utils';

export default function TotalSales({
  date,
  refreshing,
}: {
  date: Date;
  refreshing: boolean;
}) {
  const currentHour = useCurrentHour();
  const dateToday = useMemo(() => new Date(date), [date]);
  const lastWeekOfToday = useMemo(() => subDays(dateToday, 7), [dateToday]);

  const { data: transactionsToday, refetch: refetchTransactionsToday } =
    useTransactionsQuery(
      {
        status: 'SUCCESS',
        date: dateToday,
      },
      'total-sales',
    );
  const {
    data: transactionsWeekOfToday,
    refetch: refetchTransactionsWeekOfToday,
  } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: lastWeekOfToday,
    },
    'total-sales',
  );

  useEffect(() => {
    if (refreshing) {
      refetchTransactionsToday?.();
      refetchTransactionsWeekOfToday?.();
    }
  }, [refreshing]);

  const totalSalesLastWeekOfTodayWithVatInc = (transactionsWeekOfToday || [])
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.amount)
    .reduce((acc, i) => acc + i, 0);

  const totalSalesTodayWithVatInc = (transactionsToday || [])
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.amount)
    .reduce((acc, i) => acc + i, 0);

  const totalSalesPercentage =
    totalSalesLastWeekOfTodayWithVatInc === 0
      ? totalSalesTodayWithVatInc > 0
        ? 100
        : 0
      : ((totalSalesTodayWithVatInc - totalSalesLastWeekOfTodayWithVatInc) /
          totalSalesLastWeekOfTodayWithVatInc) *
        100;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/total-sales?date=${format(date, 'yyyy-MM-dd')}`)
      }
      className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
      <View className="absolute left-3 top-3 z-10">
        <Text className="font-OnestMedium text-xs text-default-secondary">
          Total Sales
        </Text>
        <Text className="mt-2 font-OnestSemiBold text-2xl text-default-primary">
          {formatPrice(totalSalesTodayWithVatInc)}
        </Text>
        <View className="flex-row items-center gap-1">
          {totalSalesTodayWithVatInc > totalSalesLastWeekOfTodayWithVatInc ? (
            <Text className="font-OnestRegular text-xs text-[#47CD89]">
              {totalSalesPercentage.toFixed(2)}%
            </Text>
          ) : (
            <Text className="font-OnestRegular text-xs text-[#F97066]">
              {totalSalesPercentage.toFixed(2)}%
            </Text>
          )}
          <Text className="font-OnestRegular text-xs text-default-secondary">
            vs{' '}
            {isToday(dateToday)
              ? format(dateToday, "'Last' eeee")
              : format(lastWeekOfToday, 'MMM d, yyyy')}
          </Text>
        </View>
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
