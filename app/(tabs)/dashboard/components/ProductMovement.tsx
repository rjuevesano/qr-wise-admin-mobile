import { format } from 'date-fns';
import { router } from 'expo-router';
import { ChevronRightIcon, InboxIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMenuItemsQuery } from '~/hooks/useMenuItemsQuery';
import { useTransactionsQuery } from '~/hooks/useTransactionsQuery';
import {
  cn,
  computeMenuItemMovementFull,
  formatPrice,
  makePluralize,
} from '~/lib/utils';

export default function ProductMovement({
  date,
  refreshing,
}: {
  date: Date;
  refreshing: boolean;
}) {
  const dateToday = useMemo(() => new Date(date), [date]);

  const { data: menuItems } = useMenuItemsQuery(
    { enabled: false },
    'menu-items',
  );

  const { data: transactions, refetch } = useTransactionsQuery(
    {
      status: 'SUCCESS' as const,
      date: dateToday,
      date2: dateToday,
      withOrders: true,
    },
    'product-movement',
  );

  const movements = useMemo(() => {
    return computeMenuItemMovementFull(transactions || [], menuItems || []);
  }, [transactions, menuItems]);

  const sortedMovements = [...movements].sort((a, b) => {
    return (a.totalSales - b.totalSales) * -1;
  });

  const filteredMovements = sortedMovements.filter((m) => m.unitSold > 0);

  useEffect(() => {
    if (refreshing) {
      refetch?.();
    }
  }, [refreshing]);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/product-movement?date=${format(date, 'yyyy-MM-dd')}`)
      }
      className="rounded-xl border border-[#22262F] bg-[#13161B] p-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-OnestMedium text-xs text-default-secondary">
          Product Movement
        </Text>
        <ChevronRightIcon color="#FFFFFF" />
      </View>
      {filteredMovements.length === 0 ? (
        <View className="flex-col items-center justify-center gap-2 rounded-lg p-10 text-center text-gray-500">
          <InboxIcon color="#CECFD2" />
          <Text className="font-OnestMedium text-sm text-default-secondary">
            No product movement yet
          </Text>
        </View>
      ) : (
        <View className="mt-6 gap-2">
          {filteredMovements.slice(0, 5).map((item, index) => (
            <View
              key={item.menuItemId}
              className={cn(
                'flex-row items-center justify-between gap-4 border-t border-[#22262F] pt-2',
                index === 0 && 'border-0',
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
    </TouchableOpacity>
  );
}
