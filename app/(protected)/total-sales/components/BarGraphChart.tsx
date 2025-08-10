import {
  eachDayOfInterval,
  endOfDay,
  format,
  isToday,
  startOfDay,
  subDays,
} from 'date-fns';
import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import useCurrentHour from '~/hooks/useCurrentHour';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import { formatNumber } from '~/lib/utils';
import { Transaction } from '~/types';

function getSalesByDate(transactions: Transaction[]) {
  const salesMap: Record<string, number> = {};

  transactions.forEach((transaction) => {
    const createdAt = transaction.createdAt?.toDate?.();
    if (!createdAt) return;

    const dateKey = format(createdAt, 'dd MMM yyyy'); // e.g. "10 Mar 2025"

    if (!salesMap[dateKey]) {
      salesMap[dateKey] = 0;
    }

    salesMap[dateKey] += transaction.amount;
  });

  return salesMap;
}

export default function BarGraphChart({
  dateToday,
  refreshing,
}: {
  dateToday: Date;
  refreshing: boolean;
}) {
  const currentHour = useCurrentHour();
  const endOfSecondWeek = useMemo(() => dateToday, [dateToday]);
  const startOfSecondWeek = useMemo(
    () => subDays(endOfSecondWeek, 6),
    [endOfSecondWeek],
  );

  const endOfFirstWeek = useMemo(
    () => subDays(startOfSecondWeek, 1),
    [startOfSecondWeek],
  );
  const startOfFirstWeek = useMemo(
    () => subDays(endOfFirstWeek, 6),
    [endOfFirstWeek],
  );

  const {
    data: transactions,
    isLoading,
    refetch,
  } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: endOfSecondWeek,
      date2: startOfFirstWeek, // full 2-week range
    },
    'total-sales',
  );

  useEffect(() => {
    if (refreshing) {
      refetch?.();
    }
  }, [refreshing]);

  const ttransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    });
  }, [transactions, currentHour]);

  const transactionsSecondWeek = ttransactions.filter((t) => {
    const createdAt = t.createdAt?.toDate?.();
    return (
      createdAt >= startOfDay(startOfSecondWeek) &&
      createdAt <= endOfDay(endOfSecondWeek)
    );
  });

  // Map sales per date
  const salesMapThisWeek = getSalesByDate(transactionsSecondWeek);

  // Build 7-day aligned chart using second week's dates
  const secondWeekDays = eachDayOfInterval({
    start: startOfSecondWeek,
    end: endOfSecondWeek,
  });

  const chartData = secondWeekDays.map((day) => {
    const thisWeekKey = format(day, 'dd MMM yyyy');
    const value = salesMapThisWeek[thisWeekKey] || 0;

    return {
      value,
      label: format(day, 'EEE'),
      frontColor: isToday(day) ? '#FFFFFF' : '#3B3F48',
      ...(isToday(day) && {
        labelTextStyle: { color: '#F7F7F7' },
      }),
      ...(value > 0 && {
        topLabelComponent: () =>
          isToday(day) ? (
            <Text className="mb-1 text-xs text-default-secondary">
              ₱{formatNumber(value)}
            </Text>
          ) : (
            <Text className="-mb-5 text-xs text-default-secondary">
              ₱{formatNumber(value)}
            </Text>
          ),
      }),
    };
  });

  return (
    <View>
      {isLoading ? (
        <View className="h-[122px] w-full animate-pulse overflow-hidden border border-[#22262F] bg-[#13161B]"></View>
      ) : (
        <BarChart
          data={chartData}
          height={122}
          barWidth={40}
          spacing={16}
          barBorderRadius={4}
          xAxisLabelTextStyle={{ color: '#A1A1AA' }} // softer gray
          xAxisThickness={0}
          yAxisTextStyle={{ color: '#A1A1AA' }} // consistent
          yAxisThickness={0}
          hideYAxisText
          rulesColor="#21262f"
          rulesType="solid"
          rulesThickness={1}
          backgroundColor="transparent"
          showYAxisIndices
          noOfSections={4}
        />
      )}
    </View>
  );
}
