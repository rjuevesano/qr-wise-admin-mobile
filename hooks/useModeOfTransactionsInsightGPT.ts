import { OpenAI } from 'openai';
import { useEffect, useState } from 'react';
import { formatPrice } from '~/lib/utils';
import { Transaction } from '~/types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type SourceType = 'DINER' | 'KIOSK' | 'SERVICE';

export function useModeOfTransactionsInsightGPT({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!transactions?.length) return;

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

    const prompt = `
Analyze and compare the three modes of transactions used today:

- Self-ordering: ${sourceCounts.KIOSK} transactions (${getPercentage(sourceTotals.KIOSK).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.KIOSK)}
- Counter: ${sourceCounts.SERVICE} transactions (${getPercentage(sourceTotals.SERVICE).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.SERVICE)}
- Table QR: ${sourceCounts.DINER} transactions (${getPercentage(sourceTotals.DINER).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.DINER)}

Highlight the dominant mode, discuss possible reasons for its performance, and mention how the other two compare. Keep it concise and add emojis for tone (e.g., 🔥 if it's strong or 😢 if low).`.trim();

    (async () => {
      setLoading(true);
      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful and concise sales analyst.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        setInsight(res.choices[0].message.content || '');
      } catch (err) {
        console.error('GPT Insight Error:', err);
        setInsight('Error generating insight.');
      } finally {
        setLoading(false);
      }
    })();
  }, [transactions]);

  return { insight, loading };
}
