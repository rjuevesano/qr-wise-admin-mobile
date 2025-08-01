import { endOfDay, format, startOfDay } from 'date-fns';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { cn } from '~/lib/utils';
import { Transaction } from '~/types';

export default function LineGraphChart({
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
  // Set start and end hour range (6 AM to 8 PM)
  const HOUR_RANGE = Array.from({ length: 15 }, (_, i) => i + 6);
  const startDate = startOfDay(dateToday);
  const endDate = endOfDay(dateToday);
  const startLastWeek = startOfDay(lastWeekOfToday);
  const endLastWeek = endOfDay(lastWeekOfToday);

  // Initialize hour maps
  const todayMap: Record<number, number> = {};
  const lastWeekMap: Record<number, number> = {};
  HOUR_RANGE.forEach((hour) => {
    todayMap[hour] = 0;
    lastWeekMap[hour] = 0;
  });

  // Orders per hour (TODAY)
  transactionsToday.forEach((tx) => {
    const txDate = tx.paymentSuccessAt?.toDate?.() || tx.createdAt?.toDate?.();
    if (txDate >= startDate && txDate <= endDate) {
      const hour = txDate.getHours();
      if (todayMap[hour] !== undefined) {
        todayMap[hour] += tx.orderIds.length || 0;
      }
    }
  });

  // Orders per hour (LAST WEEK)
  transactionsWeekOfToday.forEach((tx) => {
    const txDate = tx.paymentSuccessAt?.toDate?.() || tx.createdAt?.toDate?.();
    if (txDate >= startLastWeek && txDate <= endLastWeek) {
      const hour = txDate.getHours();
      if (lastWeekMap[hour] !== undefined) {
        lastWeekMap[hour] += tx.orderIds.length || 0;
      }
    }
  });

  // Generate ptData format
  const ptDataToday = HOUR_RANGE.map((hour) => {
    const label = new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
    return {
      value: todayMap[hour],
      label,
    };
  });

  const ptDataLastWeek = HOUR_RANGE.map((hour) => ({
    value: lastWeekMap[hour],
  }));

  const maxValue = Math.max(
    ...ptDataToday.map((d) => d.value),
    ...ptDataLastWeek.map((d) => d.value),
  );

  return (
    <View className="h-[264px] overflow-hidden rounded-xl border border-[#22262F] bg-[#13161B] py-3">
      <LineChart
        areaChart
        data={ptDataToday}
        data2={ptDataLastWeek}
        rotateLabel={false}
        hideDataPoints
        hideRules={false}
        rulesColor="#21262f"
        rulesType="solid"
        rulesThickness={1}
        spacing={70}
        color="#C2F93A"
        color2="#36BFFA"
        thickness={2}
        startFillColor="#C2F93A"
        endFillColor="#C2F93A"
        startFillColor2="#36BFFA"
        endFillColor2="#36BFFA"
        startOpacity={0.5}
        endOpacity={0.01}
        noOfSections={5}
        stepHeight={40}
        maxValue={maxValue}
        yAxisThickness={0}
        yAxisTextStyle={{
          color: '#94979C',
          fontFamily: 'OnestMedium',
          fontSize: 12,
        }}
        xAxisColor="#E5E7EB"
        xAxisLabelTextStyle={{
          color: '#383838',
          fontFamily: 'OnestMedium',
          fontSize: 13,
          textAlign: 'center',
        }}
        disableScroll={false}
        pointerConfig={{
          pointerStripColor: '#F97316',
          strokeDashArray: [5, 5],
          pointerColor: '#F97316',
          radius: 5,
          pointerLabelComponent: (items: any) => {
            const today = items[0].value;
            const yesterday = items[1].value;

            const diff = today - yesterday;
            const diffPercent = yesterday > 0 ? (diff / yesterday) * 100 : 0;

            const trendSymbol =
              diffPercent > 0 ? (
                <TrendingUp size="12" color="#1B9808" />
              ) : (
                <TrendingDown size="12" color="#E33629" />
              );
            const trendColor =
              diffPercent > 0 ? 'text-[#1B9808]' : 'text-[#E33629]';

            return (
              <View className="ml-6 w-[200px] rounded-[7px] bg-[#22262F] px-4 py-2.5">
                <Text className="text-default-primary mb-1 font-OnestSemiBold text-[13px]">
                  {items[0].label}
                </Text>
                <View className="flex-row items-center gap-1">
                  <View className="size-2 rounded-full bg-[#C2F93A]" />
                  <Text className="text-default-secondary font-OnestMedium text-sm">
                    Today: {items[0].value}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="size-2 rounded-full bg-[#36BFFA]" />
                  <Text className="text-default-secondary font-OnestMedium text-sm">
                    {format(new Date(), "'Last' EEEE")}: {items[1].value}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {trendSymbol}
                  <Text className={cn('font-OnestMedium text-sm', trendColor)}>
                    {Math.abs(diffPercent).toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
    </View>
  );
}
