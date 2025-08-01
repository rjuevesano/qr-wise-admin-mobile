import { format, isToday } from 'date-fns';
import { Text, View } from 'react-native';
import useCurrentHour from '~/hooks/useCurrentHour';
import { formatPrice } from '~/lib/utils';
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

  const totalSalesLastWeekOfTodayWithVatInc = transactionsWeekOfToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      if (createdAt && isToday(createdAt)) {
        return createdAt.getHours() <= currentHour;
      }
      return true;
    })
    .map((transaction) => {
      return transaction.amount;
    })
    .reduce((acc, i) => acc + i, 0);

  const totalSalesTodayWithVatInc = transactionsToday
    .filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      if (createdAt && isToday(createdAt)) {
        return createdAt.getHours() <= currentHour;
      }
      return true;
    })
    .map((transaction) => {
      return transaction.amount;
    })
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
    <View className="gap-1">
      <Text className="text-default-tertiary font-OnestSemiBold text-2xl">
        Total Sales
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-default-primary font-OnestSemiBold text-2xl">
          {formatPrice(totalSalesTodayWithVatInc)}
        </Text>
        {totalSalesTodayWithVatInc > totalSalesLastWeekOfTodayWithVatInc ? (
          <Text className="font-OnestRegular text-sm text-[#47CD89]">
            {totalSalesPercentage.toFixed(2)}%
          </Text>
        ) : (
          <Text className="font-OnestRegular text-sm text-[#F97066]">
            {totalSalesPercentage.toFixed(2)}%
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
