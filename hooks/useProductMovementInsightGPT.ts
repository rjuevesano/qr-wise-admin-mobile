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
}: {
  movements: MenuItemMovementWithComparison[];
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
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
Analyze the following menu item performance data and provide insights:
- Identify which menu items are top performers based on unitSold and totalSales.
- Highlight any items with a high percentageOfSales but low unitSold.
- Suggest which items might benefit from promotions or pricing adjustments.
- Output your analysis in bullet points or a short paragraph per item.

Here's the data:

${data}

Finally, provide a short overall summary of the menu's performance and trends. Keep it concise and add emojis for tone (e.g., 🔥 if it's strong or 😢 if low).`.trim();

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
  }, [movements]);

  return { insight, loading };
}
