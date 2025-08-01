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
import Svg, { Path, Rect } from 'react-native-svg';
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
          {/* total sales */}
          <TouchableOpacity
            onPress={() =>
              router.push(`/total-sales?date=${format(date, 'yyyy-MM-dd')}`)
            }
            className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="absolute left-3 top-3 z-10">
              <Text className="text-default-secondary font-OnestMedium text-xs">
                Total Sales
              </Text>
              <Text className="text-default-primary mt-2 font-OnestSemiBold text-2xl">
                ₱34,291.20
              </Text>
              <View className="flex-row items-center gap-1">
                <Text className="font-OnestRegular text-xs text-[#F97066]">
                  -40.14%
                </Text>
                <Text className="text-default-secondary font-OnestRegular text-xs">
                  vs Jul 8
                </Text>
              </View>
            </View>
            <View className="absolute right-3 top-3">
              <ChevronRightIcon color="#FFFFFF" />
            </View>
            <View className="mt-3 overflow-hidden">
              <Chart />
            </View>
          </TouchableOpacity>
          {/* total transactions + customers */}
          <View className="flex-row justify-between">
            <View className="w-[48%] gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
              <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <Rect width="28" height="28" rx="14" fill="#9CDF03" />
                <Path
                  d="M15.6666 18.9999C15.8876 18.9999 16.0995 18.9121 16.2558 18.7558C16.4121 18.5996 16.4999 18.3876 16.4999 18.1666V16.4999C16.4999 16.2789 16.4121 16.0669 16.2558 15.9107C16.0995 15.7544 15.8876 15.6666 15.6666 15.6666C15.4456 15.6666 15.2336 15.7544 15.0773 15.9107C14.921 16.0669 14.8332 16.2789 14.8332 16.4999V18.1666C14.8332 18.3876 14.921 18.5996 15.0773 18.7558C15.2336 18.9121 15.4456 18.9999 15.6666 18.9999ZM12.3332 18.9999C12.5543 18.9999 12.7662 18.9121 12.9225 18.7558C13.0788 18.5996 13.1666 18.3876 13.1666 18.1666V16.4999C13.1666 16.2789 13.0788 16.0669 12.9225 15.9107C12.7662 15.7544 12.5543 15.6666 12.3332 15.6666C12.1122 15.6666 11.9003 15.7544 11.744 15.9107C11.5877 16.0669 11.4999 16.2789 11.4999 16.4999V18.1666C11.4999 18.3876 11.5877 18.5996 11.744 18.7558C11.9003 18.9121 12.1122 18.9999 12.3332 18.9999ZM19.8332 8.99992H18.6832L17.2416 6.12492C17.1975 6.01913 17.1321 5.92357 17.0495 5.84419C16.9668 5.76482 16.8687 5.70335 16.7612 5.66362C16.6537 5.62389 16.5392 5.60676 16.4248 5.61329C16.3104 5.61983 16.1985 5.64989 16.0963 5.70159C15.994 5.7533 15.9035 5.82555 15.8304 5.91381C15.7573 6.00208 15.7032 6.10447 15.6715 6.21458C15.6398 6.3247 15.6311 6.44017 15.646 6.55379C15.661 6.66741 15.6992 6.77673 15.7582 6.87492L16.8166 8.99992L11.1832 8.99992L12.2416 6.87492C12.3225 6.68068 12.3269 6.46302 12.2539 6.26566C12.181 6.0683 12.0361 5.90583 11.8483 5.81089C11.6605 5.71595 11.4438 5.69556 11.2416 5.7538C11.0394 5.81205 10.8667 5.94463 10.7582 6.12492L9.31657 8.99992H8.16657C7.57757 9.00888 7.01064 9.22554 6.56578 9.6117C6.12093 9.99785 5.82672 10.5287 5.73505 11.1106C5.64338 11.6925 5.76014 12.2881 6.06473 12.7923C6.36932 13.2965 6.84218 13.677 7.39991 13.8666L8.01658 20.0833C8.07876 20.7021 8.36936 21.2755 8.83163 21.6915C9.29391 22.1076 9.89466 22.3364 10.5166 22.3333L17.4999 22.3333C18.1218 22.3364 18.7226 22.1076 19.1848 21.6915C19.6471 21.2755 19.9377 20.7021 19.9999 20.0833L20.6166 13.8666C21.1755 13.6764 21.6491 13.2946 21.9535 12.7887C22.2579 12.2828 22.3734 11.6854 22.2796 11.1025C22.1857 10.5196 21.8886 9.98874 21.4409 9.6039C20.9931 9.21906 20.4236 9.0051 19.8332 8.99992ZM18.3249 19.9166C18.3042 20.1229 18.2073 20.314 18.0532 20.4527C17.8991 20.5914 17.6989 20.6676 17.4916 20.6666H10.5082C10.3009 20.6676 10.1007 20.5914 9.94659 20.4527C9.7925 20.314 9.69564 20.1229 9.67491 19.9166L9.08324 13.9999L18.9166 13.9999L18.3249 19.9166ZM19.8332 12.3333L8.16657 12.3333C7.94556 12.3333 7.7336 12.2455 7.57732 12.0892C7.42104 11.9329 7.33324 11.7209 7.33324 11.4999C7.33324 11.2789 7.42104 11.0669 7.57732 10.9107C7.7336 10.7544 7.94556 10.6666 8.16657 10.6666L19.8332 10.6666C20.0543 10.6666 20.2662 10.7544 20.4225 10.9107C20.5788 11.0669 20.6666 11.2789 20.6666 11.4999C20.6666 11.7209 20.5788 11.9329 20.4225 12.0892C20.2662 12.2455 20.0543 12.3333 19.8332 12.3333Z"
                  fill="white"
                />
              </Svg>
              <View className="gap-1">
                <Text className="text-default-secondary font-OnestMedium text-xs">
                  Total Transactions
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-default-primary font-OnestSemiBold">
                    ₱51,385.50
                  </Text>
                  <Text className="font-OnestRegular text-[#47CD89]">+18%</Text>
                </View>
              </View>
            </View>
            <View className="w-[48%] gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
              <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <Rect width="28" height="28" rx="14" fill="#9CDF03" />
                <Path
                  d="M17.3337 6.8898C18.5684 7.50343 19.417 8.77762 19.417 10.25C19.417 11.7224 18.5684 12.9966 17.3337 13.6102M19.0003 17.972C20.2599 18.5419 21.3941 19.4708 22.3337 20.6667M5.66699 20.6667C7.28907 18.6021 9.49131 17.3333 11.917 17.3333C14.3427 17.3333 16.5449 18.6021 18.167 20.6667M15.667 10.25C15.667 12.3211 13.9881 14 11.917 14C9.84592 14 8.16699 12.3211 8.16699 10.25C8.16699 8.17893 9.84592 6.5 11.917 6.5C13.9881 6.5 15.667 8.17893 15.667 10.25Z"
                  stroke="white"
                  strokeWidth="1.37255"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <View className="gap-1">
                <Text className="text-default-secondary font-OnestMedium text-xs">
                  In-store Customers
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-default-primary font-OnestSemiBold">
                    0
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* mode of transaction */}
          <View className="h-[136px] rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <Text className="text-default-secondary font-OnestMedium text-xs">
              Mode of Transaction
            </Text>
            <Text className="text-default-primary mt-2 font-OnestSemiBold text-2xl">
              76% self-ordering
            </Text>
            <Text className="text-default-secondary font-OnestRegular text-xs">
              57 transactions
            </Text>
            <View className="absolute right-3 top-3">
              <ChevronRightIcon color="#FFFFFF" />
            </View>
            <View className="absolute bottom-0 right-0">
              <Svg width="146" height="91" viewBox="0 0 146 91" fill="none">
                <Path
                  d="M146 73C146 113.317 113.317 146 73 146C32.6832 146 0 113.317 0 73C0 32.6832 32.6832 0 73 0C113.317 0 146 32.6832 146 73ZM54.75 73C54.75 83.0792 62.9208 91.25 73 91.25C83.0792 91.25 91.25 83.0792 91.25 73C91.25 62.9208 83.0792 54.75 73 54.75C62.9208 54.75 54.75 62.9208 54.75 73Z"
                  fill="#373A41"
                />
                <Path
                  d="M103.696 6.76749C105.5 7.60338 107.268 8.51258 108.998 9.49283L81.9994 57.1232C81.5671 56.8781 81.1249 56.6508 80.674 56.4419L103.696 6.76749Z"
                  fill="#C2F93A"
                />
                <Path
                  d="M109.001 9.49445C124.327 18.1831 135.995 32.1216 141.85 48.7383C147.706 65.3551 147.354 83.5289 140.86 99.9068L89.9651 79.7267C91.5885 75.6322 91.6765 71.0888 90.2126 66.9346C88.7487 62.7804 85.8319 59.2958 82.0002 57.1236L109.001 9.49445Z"
                  fill="#9CDF03"
                />
                <Path
                  d="M140.854 99.9233C135.461 113.514 126.112 125.172 114.016 133.388C101.921 141.603 87.637 145.997 73.0154 146C58.3939 146.003 44.1083 141.615 32.0094 133.405C19.9106 125.195 10.556 113.541 5.15763 99.952C-0.240743 86.3635 -1.43413 71.467 1.73206 57.1924C4.89826 42.9177 12.2781 29.9228 22.9156 19.8911C33.5531 9.85944 46.9579 3.25332 61.3935 0.928586C75.8291 -1.39615 90.6301 0.667647 103.879 6.8526L80.7198 56.4632C77.4075 54.9169 73.7073 54.401 70.0984 54.9821C66.4895 55.5633 63.1383 57.2149 60.4789 59.7228C57.8195 62.2307 55.9746 65.4794 55.183 69.0481C54.3915 72.6168 54.6898 76.3409 56.0394 79.738C57.389 83.1351 59.7276 86.0487 62.7524 88.1013C65.7771 90.1538 69.3485 91.2508 73.0039 91.25C76.6593 91.2492 80.2302 90.1508 83.254 88.0969C86.2779 86.0431 88.6153 83.1285 89.9634 79.7308L140.854 99.9233Z"
                  fill="#78B300"
                />
              </Svg>
            </View>
          </View>
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
