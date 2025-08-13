import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronDownIcon, InboxIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RangeSlider from 'react-native-sticky-range-slider';
import Svg, { Path } from 'react-native-svg';
import { useDebounce } from 'use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useMenuItemsQuery } from '~/hooks/useMenuItemsQuery';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import {
  cn,
  computeMenuItemMovementFull,
  formatPrice,
  getDateFromRange,
  makePluralize,
} from '~/lib/utils';
import Insight from './components/Insight';

type SortByOption = 'name' | 'unitSold' | 'totalSales' | 'percentageOfSales';

const SORT_BY_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Units Sold', value: 'unitSold' },
  { label: 'Total Sales', value: 'totalSales' },
] as { label: string; value: SortByOption }[];

export default function ProductMovementScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  const dateToday = useMemo(() => new Date(date), [date]);

  const { data: menuItems } = useMenuItemsQuery(
    { enabled: false },
    'menu-items',
  );

  const [tab, setTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: dateToday,
    to: dateToday,
  });
  const [sortBy, setSortBy] = useState<SortByOption>('totalSales');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [min, setMin] = useState<number>(23);
  const [max, setMax] = useState<number>(30);

  const [debouncedRange] = useDebounce(range, 1500);

  const transactionQueryParams = useMemo(() => {
    return {
      status: 'SUCCESS' as const,
      date: debouncedRange?.to || dateToday,
      date2: debouncedRange?.from || dateToday,
      withOrders: true,
    };
  }, [debouncedRange, dateToday]);

  const { data: transactions, isLoading } = useTransactionsQuery(
    transactionQueryParams,
    'product-movement',
  );

  const movements = useMemo(() => {
    return computeMenuItemMovementFull(transactions || [], menuItems || []);
  }, [transactions, menuItems]);

  const sortedMovements = useMemo(() => {
    const dir = sortBy === 'name' ? 1 : -1;
    return [...movements].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortBy === 'unitSold') return (a.unitSold - b.unitSold) * dir;
      if (sortBy === 'totalSales') return (a.totalSales - b.totalSales) * dir;
      if (sortBy === 'percentageOfSales')
        return (a.percentageOfSales - b.percentageOfSales) * dir;
      return 0;
    });
  }, [movements, sortBy]);

  const filteredMovements = useMemo(
    () => sortedMovements.filter((m) => m.unitSold > 0),
    [sortedMovements],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetch or refetch here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleValueChange = useCallback((newLow: number, newHigh: number) => {
    setMin(newLow);
    setMax(newHigh);
    setRange({
      from: getDateFromRange(newLow, 30),
      to: getDateFromRange(newHigh, 30),
    });
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
          <View className="gap-1">
            <Text className="font-OnestSemiBold text-2xl text-default-tertiary">
              Product Movement
            </Text>
          </View>
          <View className="flex-row items-center justify-between rounded-lg border border-[#22262F]">
            <TouchableOpacity
              onPress={() => {
                setTab('DAILY');
                setRange({ from: dateToday, to: dateToday });
              }}
              className={cn(
                'h-9 w-1/2 items-center justify-center',
                tab === 'DAILY' &&
                  'rounded-lg border border-[#373A41] bg-[#13161B]',
              )}>
              <Text
                className={cn(
                  'font-OnestSemiBold text-default-tertiary',
                  tab === 'DAILY' && 'text-default-secondary',
                )}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTab('WEEKLY');
                // setRange({ ...range, from: subDays(dateToday, 7) });
              }}
              className={cn(
                'h-9 w-1/2 items-center justify-center',
                tab === 'WEEKLY' &&
                  'rounded-lg border border-[#373A41] bg-[#13161B]',
              )}>
              <Text
                className={cn(
                  'font-OnestSemiBold text-default-tertiary',
                  tab === 'WEEKLY' && 'text-default-secondary',
                )}>
                Weekly
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                setTab('MONTHLY');
                setRange({ ...range, from: subDays(dateToday, 30) });
              }}
              className={cn(
                'h-9 w-1/3 items-center justify-center',
                tab === 'MONTHLY' &&
                  'rounded-lg border border-[#373A41] bg-[#13161B]',
              )}>
              <Text
                className={cn(
                  'font-OnestSemiBold text-default-tertiary',
                  tab === 'MONTHLY' && 'text-default-secondary',
                )}>
                Monthly
              </Text>
            </TouchableOpacity> */}
          </View>
          {tab !== 'DAILY' && (
            <View className="gap-10">
              <Text className="font-OnestSemiBold text-sm text-default-primary">
                Date Range
              </Text>
              <RangeSlider
                style={{ paddingHorizontal: 16 }}
                min={0}
                max={30}
                step={1}
                low={min}
                high={max}
                onValueChanged={handleValueChange}
                renderLowValue={(value) => (
                  <Text className="font-OnestMedium text-default-primary">
                    {format(getDateFromRange(value, 30), 'MMM d')}
                  </Text>
                )}
                renderHighValue={(value) => (
                  <Text className="font-OnestMedium text-default-primary">
                    {format(getDateFromRange(value, 30), 'MMM d')}
                  </Text>
                )}
                renderThumb={() => (
                  <View className="size-6 rounded-full border-2 border-[#0C0E12] bg-[#C2F93A]" />
                )}
                renderRail={() => (
                  <View className="h-2 flex-1 rounded-full bg-[#373A41]" />
                )}
                renderRailSelected={() => <View className="h-2 bg-[#C2F93A]" />}
                disableRange={false}
              />
            </View>
          )}
          <View className="rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="flex-row items-center gap-1">
              <Text className="font-OnestMedium text-xs text-default-secondary">
                Sort by
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <Text className="font-OnestMedium text-xs text-[#9CDF03]">
                      {SORT_BY_OPTIONS.find((o) => o.value === sortBy)?.label}
                    </Text>
                    <ChevronDownIcon color="#9CDF03" size="12" />
                  </TouchableOpacity>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0C0E12]">
                  {SORT_BY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onPress={() => setSortBy(option.value)}>
                      <Text className="font-OnestRegular text-sm text-default-primary">
                        {option.label}
                      </Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
            {isLoading ? (
              <View className="my-20 items-center">
                <LottieView
                  autoPlay
                  style={{ width: 200, height: 200 }}
                  source={require('~/assets/lottie/washing-animation.json')}
                />
              </View>
            ) : filteredMovements.length === 0 ? (
              <View className="flex-col items-center justify-center gap-2 rounded-lg p-10 text-center text-gray-500">
                <InboxIcon color="#CECFD2" />
                <Text className="font-OnestMedium text-sm text-default-secondary">
                  No product movement yet
                </Text>
              </View>
            ) : (
              <View className="mt-3 gap-2">
                {filteredMovements.map((item, index) => (
                  <View
                    key={item.menuItemId}
                    className={cn(
                      'flex-row items-center justify-between gap-4 border-b border-[#22262F] pb-2',
                      filteredMovements.length === index + 1 && 'border-0',
                    )}>
                    <View className="flex-1">
                      <Text
                        className="font-OnestSemiBold text-lg text-default-primary"
                        numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="font-OnestRegular text-xs text-default-secondary">
                        {item.unitSold} {makePluralize('units', item.unitSold)}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center gap-1">
                        <Text className="font-OnestSemiBold text-lg text-default-primary">
                          {formatPrice(item.totalSales)}
                        </Text>
                      </View>
                      <Text className="text-right font-OnestRegular text-xs text-default-secondary">
                        {item.percentageOfSales.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Insight movements={isLoading ? [] : filteredMovements} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
