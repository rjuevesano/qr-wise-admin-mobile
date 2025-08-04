import { format } from 'date-fns';
import { OpenAI } from 'openai';
import { useEffect, useState } from 'react';
import { formatPrice } from '~/lib/utils';
import { Transaction } from '~/types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type HourlySummary = Record<string, { revenue: number; orders: number }>;

function summarizeHourly(transactions: Transaction[]): HourlySummary {
  const summary: HourlySummary = {};

  for (const t of transactions) {
    const hour = format(new Date(t.createdAt.toDate()), 'HH');
    if (!summary[hour]) {
      summary[hour] = { revenue: 0, orders: 0 };
    }
    summary[hour].revenue += t.amount;
    summary[hour].orders += 1;
  }

  // Sort by 24-hour equivalent
  const sortedEntries = Object.entries(summary).sort(([a], [b]) => {
    const to24h = (hourStr: string) => {
      const [h, period] = hourStr.split(' ');
      let hour = parseInt(h);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour;
    };

    return to24h(a) - to24h(b);
  });

  // Convert back to object (optional: use Object.fromEntries)
  const sortedSummary: HourlySummary = {};
  for (const [hour, data] of sortedEntries) {
    sortedSummary[hour] = data;
  }

  return sortedSummary;
}

export function useSalesInsightGPT({
  transactionsToday,
  transactionsLastWeek,
}: {
  transactionsToday: Transaction[];
  transactionsLastWeek: Transaction[];
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!transactionsToday?.length && !transactionsLastWeek?.length) return;

    const todayHourly = summarizeHourly(transactionsToday || []);
    const lastWeekHourly = summarizeHourly(transactionsLastWeek || []);

    const hours = Array.from(
      new Set([...Object.keys(todayHourly), ...Object.keys(lastWeekHourly)]),
    ).sort();

    const hourlyComparison = hours
      .map((hour) => {
        const h = parseInt(hour);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;

        const today = todayHourly[hour] || { revenue: 0, orders: 0 };
        const lastWeek = lastWeekHourly[hour] || { revenue: 0, orders: 0 };

        return `🕒 ${hour12} ${period}
  - Today: ${formatPrice(today.revenue)} from ${today.orders} orders with an average order value of ${formatPrice(
    today.revenue / today.orders,
  )}
  - Last Week: ${formatPrice(lastWeek.revenue)} from ${lastWeek.orders} orders with an average order value of ${formatPrice(
    lastWeek.revenue / lastWeek.orders,
  )}`;
      })
      .join('\n\n');

    const prompt = `
    As business owner, I want you to generate a summary and insights about the question and the json result:

    Here's the data:
    ${hourlyComparison}

    Please create a comprehensive summary of these query results. Focus on the key findings, patterns, and notable information.
    
    Please provide your response in the following format:
    
    ## Summary
    [Your plain-text summary]
    
    ## Analytical Insights
    [Provide 2-3 analytical insights or recommendations based on the data in summary]
    
    Guidelines:
    - Be specific with numbers and dates when available
    - Highlight the most important findings first
    - Use clear, non-technical language
    - If data shows trends, mention them clearly
    - Keep the summary concise but informative
    - IMPORTANT: All monetary values should be formatted in Philippine Peso (PHP). Use ₱ symbol or 'PHP' prefix (e.g., ₱1,234.56 or PHP 1,234.56)
    - Format large numbers with commas for readability (e.g., ₱1,234,567.89)
    - Always include currency symbol/prefix when mentioning monetary amounts, revenue, sales, or financial figures`.trim();

    (async () => {
      setLoading(true);
      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a data analyst expert at creating clear, insightful summaries of database query results. Always provide factual, accurate information based on the data provided.',
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
  }, [transactionsToday, transactionsLastWeek]);

  return { insight, loading };
}
