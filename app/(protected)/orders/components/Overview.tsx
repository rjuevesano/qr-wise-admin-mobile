import { format, isToday } from 'date-fns';
import { Text, View } from 'react-native';
import useCurrentHour from '~/hooks/useCurrentHour';
import { Transaction } from '~/types';

export default function Overview({
  dateToday,
  lastWeekOfToday,
  transactionsWeekOfToday,
  transactionsToday,
}: {
  dateToday: Date;
  lastWeekOfToday: Date;
  transactionsWeekOfToday: Transaction[];
  transactionsToday: Transaction[];
}) {
  const currentHour = useCurrentHour();

  const totalOrdersLastWeek = transactionsWeekOfToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.orderIds)
    .reduce((acc, i) => acc + i.length, 0);

  const totalOrdersToday = transactionsToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.orderIds)
    .reduce((acc, i) => acc + i.length, 0);

  const totalOrdersPercentage =
    totalOrdersLastWeek === 0
      ? totalOrdersToday > 0
        ? 100
        : 0
      : ((totalOrdersToday - totalOrdersLastWeek) / totalOrdersLastWeek) * 100;

  return (
    <View className="gap-1">
      <Text className="text-default-tertiary font-OnestSemiBold text-2xl">
        Orders
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-default-primary font-OnestSemiBold text-2xl">
          {totalOrdersToday}
        </Text>
        {totalOrdersToday > totalOrdersLastWeek ? (
          <Text className="font-OnestRegular text-sm text-[#47CD89]">
            {totalOrdersPercentage.toFixed(2)}%
          </Text>
        ) : (
          <Text className="font-OnestRegular text-sm text-[#F97066]">
            {totalOrdersPercentage.toFixed(2)}%
          </Text>
        )}
        <Text className="text-default-secondary font-OnestRegular text-sm">
          vs{' '}
          {isToday(dateToday)
            ? format(dateToday, "'Last' eeee")
            : format(lastWeekOfToday, 'MMM d, yyyy')}
        </Text>
      </View>
    </View>
  );
}
