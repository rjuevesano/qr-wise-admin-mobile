import {
  eachDayOfInterval,
  endOfDay,
  format,
  isToday,
  startOfDay,
  subDays,
} from 'date-fns';
import { useMemo } from 'react';
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

export default function BarGraphChart({ dateToday }: { dateToday: Date }) {
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

  const { data: transactions } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: endOfSecondWeek,
      date2: startOfFirstWeek, // full 2-week range
    },
    'total-sales',
  );

  const ttransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      const createdAt = t.createdAt?.toDate?.();

      if (createdAt && isToday(createdAt)) {
        return createdAt.getHours() <= currentHour;
      }

      return true;
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
            <Text className="text-default-secondary mb-0 text-xs">
              ₱{formatNumber(value)}
            </Text>
          ) : (
            <Text className="text-default-secondary -mb-5 text-xs">
              ₱{formatNumber(value)}
            </Text>
          ),
      }),
    };
  });

  return (
    <View>
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
    </View>
  );
}
