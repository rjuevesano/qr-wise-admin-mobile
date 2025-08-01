import { format } from 'date-fns';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import TypeWriter from 'react-native-typewriter-effect';
import WiseAi from '~/components/icons/WiseAi';
import useCurrentHour from '~/hooks/useCurrentHour';
import { useSalesInsightGPT } from '~/hooks/useSalesInsightGPT';
import { formatPrice } from '~/lib/utils';
import { Transaction } from '~/types';

export default function Insight({
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
  const hour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
  const period = currentHour >= 12 ? 'PM' : 'AM';

  const todayTransactions = useMemo(() => {
    return transactionsToday.filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    });
  }, [transactionsToday, currentHour]);

  const lastWeekTransactions = useMemo(() => {
    return transactionsWeekOfToday.filter((t) => {
      const createdAt = t.createdAt?.toDate?.();
      return createdAt.getHours() <= currentHour;
    });
  }, [transactionsWeekOfToday, currentHour]);

  const { insight, loading } = useSalesInsightGPT({
    transactionsToday: todayTransactions,
    transactionsLastWeek: lastWeekTransactions,
  });

  const totalSalesLastWeekOfTodayWithVatInc = lastWeekTransactions
    .map((transaction) => transaction.amount)
    .reduce((acc, i) => acc + i, 0);

  const totalSalesTodayWithVatInc = todayTransactions
    .map((transaction) => transaction.amount)
    .reduce((acc, i) => acc + i, 0);

  return (
    <>
      <View className="flex-row justify-between">
        <View className="w-[48%] gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <View className="flex-row gap-2">
            <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <Rect x="1" y="1" width="10" height="10" rx="5" fill="#0C0E12" />
              <Rect
                x="1"
                y="1"
                width="10"
                height="10"
                rx="5"
                stroke="#C2F93A"
                strokeWidth="2"
              />
            </Svg>
            <Text className="text-default-secondary font-OnestMedium">
              {format(dateToday, 'MMM d, EEEE')}
            </Text>
          </View>
          <View className="gap-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-default-primary font-OnestSemiBold text-2xl">
                {formatPrice(totalSalesTodayWithVatInc)}
              </Text>
            </View>
            <Text className="text-default-secondary font-OnestMedium text-xs">
              {hour12}
              {period}
            </Text>
          </View>
        </View>
        <View className="w-[48%] gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <View className="flex-row gap-2">
            <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <Rect x="1" y="1" width="10" height="10" rx="5" fill="#0C0E12" />
              <Rect
                x="1"
                y="1"
                width="10"
                height="10"
                rx="5"
                stroke="#36BFFA"
                strokeWidth="2"
              />
            </Svg>
            <Text className="text-default-secondary font-OnestMedium">
              {format(lastWeekOfToday, 'MMM d, EEEE')}
            </Text>
          </View>
          <View className="gap-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-default-primary font-OnestSemiBold text-2xl">
                {formatPrice(totalSalesLastWeekOfTodayWithVatInc)}
              </Text>
            </View>
            <Text className="text-default-secondary font-OnestMedium text-xs">
              {hour12}
              {period}
            </Text>
          </View>
        </View>
      </View>
      <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
        <View className="flex-row items-center gap-2">
          <WiseAi />
          <Text className="text-default-primary font-OnestSemiBold text-sm">
            Wise AI Insights
          </Text>
        </View>
        {loading ? (
          <Text className="text-default-tertiary font-OnestRegular">
            Loading insights...
          </Text>
        ) : (
          <TypeWriter
            content={insight}
            minDelay={5}
            maxDelay={10}
            vibration={false}
            backspaceEffect={false}
            style={{
              color: '#F7F7F7',
              fontSize: 16,
              fontFamily: 'Onest-Regular',
            }}
          />
        )}
      </View>
    </>
  );
}
