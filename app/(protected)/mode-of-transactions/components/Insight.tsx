import { Text, View } from 'react-native';
import TypeWriter from 'react-native-typewriter-effect';
import WiseAi from '~/components/icons/WiseAi';
import { useModeOfTransactionsInsightGPT } from '~/hooks/useModeOfTransactionsInsightGPT';
import { Transaction } from '~/types';

export default function Insight({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { insight, loading } = useModeOfTransactionsInsightGPT({
    transactions,
  });

  return (
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
  );
}
