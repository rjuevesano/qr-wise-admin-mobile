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
    As business owner, I want you to generate a summary and insights about the question and the json result:

    Here's the data:

    - Self-ordering: ${sourceCounts.KIOSK} transactions (${getPercentage(sourceTotals.KIOSK).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.KIOSK)}
    - Counter: ${sourceCounts.SERVICE} transactions (${getPercentage(sourceTotals.SERVICE).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.SERVICE)}
    - Table QR: ${sourceCounts.DINER} transactions (${getPercentage(sourceTotals.DINER).toFixed(2)}%) with a total of ${formatPrice(sourceTotals.DINER)}

    Please create a comprehensive summary of these query results. Focus on the key findings, patterns, and notable information.
    
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
  }, [transactions]);

  return { insight, loading };
}
