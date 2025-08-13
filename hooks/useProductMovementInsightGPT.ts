import { OpenAI } from 'openai';
import { useEffect, useState } from 'react';
import { formatPrice } from '~/lib/utils';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export type MenuItemMovementWithComparison = {
  menuItemId: string;
  name: string;
  unitSold: number;
  totalSales: number;
  percentageOfSales: number;
};

export function useProductMovementInsightGPT({
  movements,
  enabled = true,
}: {
  movements: MenuItemMovementWithComparison[];
  enabled: boolean;
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    if (!movements?.length) return;

    const data = movements.map((m) => {
      return `
      - Menu Item: ${m.name}
      - Units Sold: ${m.unitSold}
      - Total Sales: ${formatPrice(m.totalSales)}
      - Percentage of Sales: ${m.percentageOfSales.toFixed(2)}%
      `;
    });

    const prompt = `
    As business owner, I want you to generate a summary and insights about the question and the json result:

    Here's the data:
    ${data}

    Please create a comprehensive summary of these query results. Focus on the key findings, patterns, and notable information.
    
    Please provide your response in the following format:
    
    Summary

    [Your plain-text summary]
    
    Analytical Insights
    
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
          temperature: 0.2,
        });

        setInsight(res.choices[0].message.content || '');
      } catch {
        setInsight('Error generating insight.');
      } finally {
        setLoading(false);
      }
    })();
  }, [movements, enabled]);

  return { insight, loading };
}
