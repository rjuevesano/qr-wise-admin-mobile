import { useQuery } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useAuth } from '~/context/AuthUserContext';
import { useOrders } from '~/context/OrdersContext';
import { db } from '~/lib/firebase';
import { Order, PaymentMethod, Transaction } from '~/types';

const fetchTransactions = async ({
  storeId,
  orders,
  status,
  onlyPending,
  sort,
  date,
  date2,
  time,
  paymentMethod,
  count,
  withOrders = false,
}: {
  storeId: string;
  orders: Order[];
  status?: string;
  onlyPending?: boolean;
  sort?: 'asc' | 'desc';
  date?: Date;
  date2?: Date;
  time?: { startTime: string; endTime: string };
  paymentMethod?: PaymentMethod | 'ALL';
  count?: number;
  withOrders?: boolean;
}) => {
  const queryConstraints: QueryConstraint[] = [
    where('storeId', '==', storeId),
    orderBy('createdAt', sort ?? 'asc'),
  ];

  if (status) queryConstraints.push(where('status', '==', status));
  if (onlyPending) queryConstraints.push(where('orderStatus', '==', 'PENDING'));

  if (date && date2) {
    const start = new Date(date2);
    const end = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    queryConstraints.push(
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
    );
  } else if (date) {
    const start = new Date(date);
    const end = new Date(date);
    if (time?.startTime && time?.endTime) {
      const [sh, sm] = time.startTime.split(':').map(Number);
      const [eh, em] = time.endTime.split(':').map(Number);
      start.setHours(sh, sm, 0, 0);
      end.setHours(eh, em, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    queryConstraints.push(
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
    );
  }

  if (paymentMethod && paymentMethod !== 'ALL') {
    queryConstraints.push(where('paymentMethod', '==', paymentMethod));
  }

  if (count) queryConstraints.push(limit(count));

  const q = query(collection(db, 'transactions'), ...queryConstraints);
  const querySnapshot = await getDocs(q);

  const transactions = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const transaction = { ...docSnap.data(), id: docSnap.id } as Transaction;

      if (withOrders) {
        const orderData = await Promise.all(
          (transaction.orderIds || []).map(async (orderId) => {
            const order = orders.find((o) => o.id === orderId);
            return order || null;
          }),
        );
        transaction.orders = orderData.filter(Boolean) as Order[];
      }

      return transaction;
    }),
  );

  return transactions;
};

export const useTransactionsQuery = (
  params: {
    status?: string;
    onlyPending?: boolean;
    sort?: 'asc' | 'desc';
    date?: Date;
    date2?: Date;
    time?: { startTime: string; endTime: string };
    paymentMethod?: PaymentMethod | 'ALL';
    count?: number;
    withOrders?: boolean;
  },
  key: string,
) => {
  const { store } = useAuth();
  const { orders } = useOrders();

  return useQuery({
    queryKey: [key, store?.id, params],
    queryFn: () =>
      fetchTransactions({ storeId: store?.id!, orders, ...params }),
    enabled: !!store?.id, // Only run if store is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
