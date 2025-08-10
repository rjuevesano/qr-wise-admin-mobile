import { subDays } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import BarGraphChart from './components/BarGraphChart';
import Insight from './components/Insight';
import LineGraphChart from './components/LineGraphChart';
import Overview from './components/Overview';

export default function TotalSalesScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

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

  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (refreshing) {
      refetchTransactionsToday?.();
      refetchTransactionsWeekOfToday?.();
    }
  }, [refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetch or refetch here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View className="flex-1 bg-[#0C0E12]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="size-10 items-center justify-center">
            <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <Path
                d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
                fill="#22262F"
              />
              <Path
                d="M21.8332 15.9998H10.1665M10.1665 15.9998L15.9998 21.8332M10.1665 15.9998L15.9998 10.1665"
                stroke="#CECFD2"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text />
          <View className="size-10" />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 120,
            paddingHorizontal: 16,
            gap: 16,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Overview
            dateToday={dateToday}
            lastWeekOfToday={lastWeekOfToday}
            transactionsWeekOfToday={transactionsWeekOfToday || []}
            transactionsToday={transactionsToday || []}
          />
          <BarGraphChart dateToday={dateToday} refreshing={refreshing} />
          <LineGraphChart
            dateToday={dateToday}
            lastWeekOfToday={lastWeekOfToday}
            transactionsWeekOfToday={transactionsWeekOfToday || []}
            transactionsToday={transactionsToday || []}
          />
          <Insight
            dateToday={dateToday}
            lastWeekOfToday={lastWeekOfToday}
            transactionsWeekOfToday={transactionsWeekOfToday || []}
            transactionsToday={transactionsToday || []}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
