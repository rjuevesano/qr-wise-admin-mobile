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

  const totalCustomersLastWeekOfToday = transactionsWeekOfToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.numPax || 1)
    .reduce((acc, i) => acc + i, 0);

  const totalCustomersToday = transactionsToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    })
    .map((transaction) => transaction.numPax || 1)
    .reduce((acc, i) => acc + i, 0);

  const totalCustomersPercentage =
    totalCustomersLastWeekOfToday === 0
      ? totalCustomersToday > 0
        ? 100
        : 0
      : ((totalCustomersToday - totalCustomersLastWeekOfToday) /
          totalCustomersLastWeekOfToday) *
        100;

  return (
    <View className="gap-1">
      <Text className="font-OnestSemiBold text-2xl text-default-tertiary">
        In-store Foot Traffic
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="font-OnestSemiBold text-2xl text-default-primary">
          {totalCustomersToday}
        </Text>
        {totalCustomersToday > totalCustomersLastWeekOfToday ? (
          <Text className="font-OnestRegular text-sm text-[#47CD89]">
            {totalCustomersPercentage.toFixed(2)}%
          </Text>
        ) : (
          <Text className="font-OnestRegular text-sm text-[#F97066]">
            {totalCustomersPercentage.toFixed(2)}%
          </Text>
        )}
        <Text className="font-OnestRegular text-sm text-default-secondary">
          vs{' '}
          {isToday(dateToday)
            ? format(dateToday, "'Last' eeee")
            : format(lastWeekOfToday, 'MMM d, yyyy')}
        </Text>
      </View>
    </View>
  );
}
