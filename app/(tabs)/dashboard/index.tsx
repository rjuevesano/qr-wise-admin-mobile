import { format, isToday } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import FloatingMenu from '~/components/FloatingMenu';
import Chart from '~/components/icons/Chart';
import Logo from '~/components/icons/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import DailyWeatherForecast, {
  WeatherType,
} from '~/components/WeatherForecast';
import { useAuth } from '~/context/AuthUserContext';
import { getTimeOfDay } from '~/lib/utils';
import ModeOfTransactions from './components/ModeOfTransactions';
import TotalSales from './components/TotalSales';
import TotalTransactionsAndCustomers from './components/TotalTransactionsAndCustomers';

export default function DashboardScreen() {
  const { user, toggleSheet } = useAuth();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const defaultStyles = useDefaultStyles('dark');
  const dateRef = useRef(null);
  const [date, setDate] = useState<Date>(new Date());

  const [weatherData, setWeatherData] = useState<WeatherType | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchWeather();
    }, []),
  );

  const fetchWeather = async () => {
    try {
      const res = await fetch('https://admin.qrwise.com/api/weather');
      if (!res.ok) throw new Error('Failed to fetch weather');

      const data = await res.json();
      setWeatherData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-[#0C0E12]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-1">
          <View className="w-32">
            <Text className="text-default-primary font-OnestSemiBold text-base">
              {isToday(date) ? format(date, 'EEE, MMM d') : ''}
            </Text>
          </View>
          <DropdownMenu>
            <DropdownMenuTrigger ref={dateRef} asChild>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text className="text-default-primary font-OnestSemiBold text-base">
                  {isToday(date) ? 'Today' : format(date, 'EEE, MMM d')}
                </Text>
                <ChevronDownIcon color="#CECFD2" size="18" />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent insets={contentInsets} className="mt-1 p-0">
              <DateTimePicker
                mode="single"
                maxDate={new Date()}
                showOutsideDays
                date={date}
                onChange={({ date }) => {
                  if (date) {
                    setDate(date as Date);
                    // @ts-ignore
                    dateRef.current?.close();
                  }
                }}
                styles={{ ...defaultStyles }}
                className="bg-[#13161B]"
                components={{
                  IconPrev: <ArrowLeftIcon color="#CECFD2" />,
                  IconNext: <ArrowRightIcon color="#CECFD2" />,
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <View className="w-32 flex-row items-center justify-end gap-3">
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <Path
                  d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
                  fill="#22262F"
                />
                <Path
                  d="M13.795 23.5C14.3826 24.0186 15.1544 24.3333 15.9998 24.3333C16.8452 24.3333 17.6171 24.0186 18.2047 23.5M20.9998 12.6666C20.9998 11.3405 20.473 10.0688 19.5353 9.13109C18.5977 8.19341 17.3259 7.66663 15.9998 7.66663C14.6737 7.66663 13.402 8.19341 12.4643 9.13109C11.5266 10.0688 10.9998 11.3405 10.9998 12.6666C10.9998 15.2418 10.3502 17.0049 9.62453 18.1711C9.01242 19.1549 8.70636 19.6467 8.71758 19.7839C8.73001 19.9359 8.7622 19.9938 8.88463 20.0846C8.99519 20.1666 9.49364 20.1666 10.4905 20.1666H21.5091C22.506 20.1666 23.0044 20.1666 23.115 20.0846C23.2374 19.9938 23.2696 19.9359 23.282 19.7839C23.2933 19.6467 22.9872 19.1549 22.3751 18.1711C21.6494 17.0049 20.9998 15.2418 20.9998 12.6666Z"
                  stroke="#CECFD2"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSheet}>
              <Logo />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 140,
            paddingHorizontal: 16,
            gap: 16,
          }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-default-primary font-OnestSemiBold text-2xl">
              Good {getTimeOfDay()},{'\n'}
              {user?.name}
            </Text>
            {weatherData && (
              <DailyWeatherForecast dailyData={[weatherData.daily?.[0]]} />
            )}
          </View>
          <TotalSales date={date} />
          <TotalTransactionsAndCustomers date={date} />
          <ModeOfTransactions date={date} />
          {/* orders */}
          <View className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="absolute left-3 top-3 z-10">
              <Text className="text-default-secondary font-OnestMedium text-xs">
                Orders
              </Text>
              <Text className="text-default-primary mt-2 font-OnestSemiBold text-2xl">
                8 orders
              </Text>
              <Text className="text-default-secondary font-OnestRegular text-xs">
                average last hour
              </Text>
            </View>
            <View className="absolute right-3 top-3">
              <ChevronRightIcon color="#FFFFFF" />
            </View>
            <View className="mt-3 overflow-hidden">
              <Chart />
            </View>
          </View>
          {/* product movement */}
          <View className="rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-default-secondary font-OnestMedium text-xs">
                Product Movement
              </Text>
              <ChevronRightIcon color="#FFFFFF" />
            </View>
            <View className="mt-6 gap-2">
              <View className="flex-row items-center justify-between border-b border-[#22262F] pb-2">
                <View>
                  <Text className="text-default-primary font-OnestSemiBold text-lg">
                    Pistachio Latte
                  </Text>
                  <Text className="text-default-secondary font-OnestRegular text-xs">
                    22 units
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-OnestRegular text-xs text-[#47CD89]">
                      +18%
                    </Text>
                    <Text className="text-default-primary font-OnestSemiBold text-lg">
                      ₱4,840.00
                    </Text>
                  </View>
                  <Text className="text-default-secondary text-right font-OnestRegular text-xs">
                    14.77%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between border-b border-[#22262F] pb-2">
                <View>
                  <Text className="text-default-primary font-OnestSemiBold text-lg">
                    Loca’s Ube Cheesecake
                  </Text>
                  <Text className="text-default-secondary font-OnestRegular text-xs">
                    10 units
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-OnestRegular text-xs text-[#47CD89]">
                      +23%
                    </Text>
                    <Text className="text-default-primary font-OnestSemiBold text-lg">
                      ₱3,950.00
                    </Text>
                  </View>
                  <Text className="text-default-secondary text-right font-OnestRegular text-xs">
                    12.05%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between border-b border-[#22262F] pb-2">
                <View>
                  <Text className="text-default-primary font-OnestSemiBold text-lg">
                    Classic Beef Tapa
                  </Text>
                  <Text className="text-default-secondary font-OnestRegular text-xs">
                    6 units
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-OnestRegular text-xs text-[#F97066]">
                      -10%
                    </Text>
                    <Text className="text-default-primary font-OnestSemiBold text-lg">
                      ₱3,360.00
                    </Text>
                  </View>
                  <Text className="text-default-secondary text-right font-OnestRegular text-xs">
                    10.25%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between border-b border-[#22262F] pb-2">
                <View>
                  <Text className="text-default-primary font-OnestSemiBold text-lg">
                    Miso Caramel-glazed Salmon
                  </Text>
                  <Text className="text-default-secondary font-OnestRegular text-xs">
                    6 units
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-OnestRegular text-xs text-[#F97066]">
                      -16%
                    </Text>
                    <Text className="text-default-primary font-OnestSemiBold text-lg">
                      ₱2,880.00
                    </Text>
                  </View>
                  <Text className="text-default-secondary text-right font-OnestRegular text-xs">
                    8.79%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between pb-2">
                <View>
                  <Text className="text-default-primary font-OnestSemiBold text-lg">
                    Crispy Pork Belly
                  </Text>
                  <Text className="text-default-secondary font-OnestRegular text-xs">
                    5 units
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-OnestRegular text-xs text-[#F97066]">
                      -2%
                    </Text>
                    <Text className="text-default-primary font-OnestSemiBold text-lg">
                      ₱2,100.00
                    </Text>
                  </View>
                  <Text className="text-default-secondary text-right font-OnestRegular text-xs">
                    6.41%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <FloatingMenu />
      </SafeAreaView>
    </View>
  );
}
