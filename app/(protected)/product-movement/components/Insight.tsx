import { useMemo } from 'react';
import { Text, View } from 'react-native';
import TypeWriter from 'react-native-typewriter-effect';
import WiseAi from '~/components/icons/WiseAi';
import {
  MenuItemMovementWithComparison,
  useProductMovementInsightGPT,
} from '~/hooks/useProductMovementInsightGPT';

export default function Insight({
  movements,
}: {
  movements: MenuItemMovementWithComparison[];
}) {
  const data = useMemo(() => movements, [movements]);
  const { insight, loading } = useProductMovementInsightGPT({
    movements: data,
  });

  return (
    <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
      <View className="flex-row items-center gap-2">
        <WiseAi />
        <Text className="font-OnestSemiBold text-sm text-default-primary">
          Wise AI Insights
        </Text>
      </View>
      {loading ? (
        <Text className="font-OnestRegular text-default-tertiary">
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
  );
}
