import { OpenAI } from 'openai';
import { useEffect, useState } from 'react';
import { formatPrice } from '~/lib/utils';
import { Transaction } from '~/types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function summarizeTransactions(transactions: Transaction[]) {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalRevenue / (totalOrders || 1);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
  };
}

function getTimeOfDayGreeting(hour: number): string {
  if (hour < 11) return 'It is currently the morning.';
  if (hour < 15) return 'It is currently the early afternoon.';
  if (hour < 18) return 'It is currently the late afternoon.';
  return 'It is currently the evening.';
}

export function useSalesInsightGPT({
  currentHour,
  transactionsToday,
  transactionsLastWeek,
}: {
  currentHour: number;
  transactionsToday: Transaction[];
  transactionsLastWeek: Transaction[];
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!transactionsToday?.length && !transactionsLastWeek?.length) return;

    const todaySummary = summarizeTransactions(transactionsToday || []);
    const lastWeekSummary = summarizeTransactions(transactionsLastWeek || []);

    const timeContext = getTimeOfDayGreeting(currentHour);

    const prompt = `
${timeContext}
Compare today's and last week's sales performance up to this time of day.

Today's Summary:
- Total Revenue: ${formatPrice(todaySummary.totalRevenue)}
- Total Orders: ${todaySummary.totalOrders}
- Average Order Value: ${formatPrice(todaySummary.avgOrderValue)} 

Same Day Last Week:
- Total Revenue: ${formatPrice(lastWeekSummary.totalRevenue)}
- Total Orders: ${lastWeekSummary.totalOrders}
- Average Order Value: ${formatPrice(lastWeekSummary.avgOrderValue)}

Provide a short, insightful analysis. Highlight any significant differences or trends.`.trim();

    (async () => {
      setLoading(true);
      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful sales analyst.',
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
  }, [transactionsToday, transactionsLastWeek, currentHour]);

  return { insight, loading };
}
