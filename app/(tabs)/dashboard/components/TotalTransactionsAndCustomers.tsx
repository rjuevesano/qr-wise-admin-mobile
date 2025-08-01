import { subDays } from 'date-fns';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';

export default function TotalTransactionsAndCustomers({
  date,
}: {
  date: Date;
}) {
  const dateToday = useMemo(() => new Date(date), [date]);
  const lastWeekOfToday = useMemo(() => subDays(dateToday, 7), [dateToday]);

  const { data: transactionsToday } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: dateToday,
    },
    'total-sales',
  );
  const { data: transactionsWeekOfToday } = useTransactionsQuery(
    {
      status: 'SUCCESS',
      date: lastWeekOfToday,
    },
    'total-sales',
  );

  const countLastWeekOfToday = (transactionsWeekOfToday || []).length;
  const countToday = (transactionsToday || []).length;
  const countCustomers = (transactionsToday || []).reduce(
    (acc, t) => acc + t.numPax || 1,
    0,
  );

  const totalTransactionsPercentage =
    countLastWeekOfToday === 0
      ? countToday > 0
        ? 100
        : 0
      : ((countToday - countLastWeekOfToday) / countLastWeekOfToday) * 100;

  return (
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
            <Text className="text-default-primary font-OnestSemiBold text-2xl">
              {countToday}
            </Text>
            {countToday > countLastWeekOfToday ? (
              <Text className="font-OnestRegular text-xs text-[#47CD89]">
                {totalTransactionsPercentage.toFixed(2)}%
              </Text>
            ) : (
              <Text className="font-OnestRegular text-xs text-[#F97066]">
                {totalTransactionsPercentage.toFixed(2)}%
              </Text>
            )}
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
            <Text className="text-default-primary font-OnestSemiBold text-2xl">
              {countCustomers}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
