import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Transaction } from '~/types';

type SourceType = 'DINER' | 'KIOSK' | 'SERVICE';

export default function PieGraphChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const sourceTotals: Record<SourceType, number> = {
    DINER: 0,
    KIOSK: 0,
    SERVICE: 0,
  };

  const sourceCounts: Record<SourceType, number> = {
    DINER: 0,
    KIOSK: 0,
    SERVICE: 0,
  };

  const updatedTransactions = transactions;
  updatedTransactions.forEach((tx) => {
    sourceTotals[tx.source as SourceType] += tx.amount;
    sourceCounts[tx.source as SourceType] += 1;
  });

  const totalAmount = Object.values(sourceTotals).reduce(
    (sum, val) => sum + val,
    0,
  );

  const getPercentage = (value: number) =>
    totalAmount > 0 ? (value / totalAmount) * 100 : 0;

  const pieData = [
    {
      value: sourceCounts.DINER,
      color: '#78B300',
      label: 'Table QR',
    },
    {
      value: sourceCounts.SERVICE,
      color: '#9CDF03',
      label: 'Counter',
    },
    {
      value: sourceCounts.KIOSK,
      color: '#C2F93A',
      label: 'Self-Ordering',
    },
  ];

  return (
    <View className="h-[364px] items-center overflow-hidden rounded-xl border border-[#22262F] bg-[#13161B] py-3">
      <PieChart
        data={pieData}
        donut
        sectionAutoFocus
        showText
        radius={120}
        textColor="#000000"
        textSize={14}
        font="OnestRegular"
        showValuesAsLabels
        innerRadius={0}
      />
      <View className="mt-5 gap-5">
        <View className="flex-row gap-5">
          <View className="flex-row gap-2">
            <View className="mt-1 size-2 rounded-full bg-[#78B300]" />
            <View className="flex-row items-center gap-2">
              <Text className="text-default-tertiary font-OnestRegular text-sm">
                Table QR
              </Text>
              <Text className="text-default-tertiary font-OnestRegular text-sm">
                • {getPercentage(sourceTotals.DINER).toFixed(2)}%
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="mt-1 size-2 rounded-full bg-[#9CDF03]" />
            <View className="flex-row items-center gap-2">
              <Text className="text-default-tertiary font-OnestRegular text-sm">
                Counter
              </Text>
              <Text className="text-default-tertiary font-OnestRegular text-sm">
                • {getPercentage(sourceTotals.SERVICE).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-center gap-2">
          <View className="mt-1 size-2 rounded-full bg-[#C2F93A]" />
          <View className="flex-row items-center gap-2">
            <Text className="text-default-tertiary font-OnestRegular text-sm">
              Self-Ordering
            </Text>
            <Text className="text-default-tertiary font-OnestRegular text-sm">
              • {getPercentage(sourceTotals.KIOSK).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
