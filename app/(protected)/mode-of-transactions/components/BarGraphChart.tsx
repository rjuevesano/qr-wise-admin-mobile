import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from 'date-fns';
import { useMemo } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import useCurrentHour from '~/hooks/useCurrentHour';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import { Transaction } from '~/types';

type SourceType = 'DINER' | 'KIOSK' | 'SERVICE';

function getSourceByDate(transactions: Transaction[]) {
  const sourceMap: Record<string, Record<SourceType, number>> = {};

  transactions.forEach((transaction) => {
    const createdAt = transaction.createdAt?.toDate?.();
    if (!createdAt) return;

    const dateKey = format(createdAt, 'dd MMM yyyy'); // e.g. "10 Mar 2025"

    if (!sourceMap[dateKey]) {
      sourceMap[dateKey] = {
        DINER: 0,
        KIOSK: 0,
        SERVICE: 0,
      };
    }

    if (transaction.source === 'DINER') {
      sourceMap[dateKey].DINER += 1;
    } else if (transaction.source === 'KIOSK') {
      sourceMap[dateKey].KIOSK += 1;
    } else if (transaction.source === 'SERVICE') {
      sourceMap[dateKey].SERVICE += 1;
    }
  });

  return sourceMap;
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

  const { data: transactions, isLoading } = useTransactionsQuery(
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

  const sourceMapThisWeek = getSourceByDate(transactionsSecondWeek);

  // Build 7-day aligned chart using second week's dates
  const secondWeekDays = eachDayOfInterval({
    start: startOfSecondWeek,
    end: endOfSecondWeek,
  });

  const chartData = secondWeekDays.map((day) => {
    const thisWeekKey = format(day, 'dd MMM yyyy');

    return {
      label: format(day, 'EEE'),
      stacks: Object.entries(sourceMapThisWeek[thisWeekKey] || {}).map(
        ([source, amount], index) => ({
          marginBottom: index === 0 ? 0 : 1,
          value: amount,
          color:
            source === 'DINER'
              ? '#78B300'
              : source === 'KIOSK'
                ? '#C2F93A'
                : '#9CDF03',
        }),
      ),
    };
  });

  return (
    <View>
      {isLoading ? (
        <View className="h-[122px] w-full animate-pulse overflow-hidden border border-[#22262F] bg-[#13161B]"></View>
      ) : (
        <BarChart
          stackData={chartData}
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
