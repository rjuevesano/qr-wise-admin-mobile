import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '~/context/AuthUserContext';
import { db } from '~/lib/firebase';
import { Order, PaymentMethod, Transaction } from '~/types';

const useTransactions = ({
  status,
  onlyPending = false,
  sort = 'asc',
  date,
  date2,
  time,
  paymentMethod,
  count,
}: {
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  onlyPending?: boolean;
  sort?: 'asc' | 'desc';
  date?: Date;
  date2?: Date;
  time?: { startTime: string; endTime: string };
  paymentMethod?: PaymentMethod | 'ALL';
  count?: number;
}) => {
  const { store } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!store) return;

    setLoading(true);

    const queryConstraints: QueryConstraint[] = [
      where('storeId', '==', store.id!),
      orderBy('orderNum', sort),
    ];

    if (status) {
      queryConstraints.push(where('status', '==', status));
    }

    if (onlyPending) {
      queryConstraints.push(where('orderStatus', '==', 'PENDING'));
    }

    if (date && date2) {
      const start: Date = new Date(date2);
      const end: Date = new Date(date);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      queryConstraints.push(
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
      );
    } else if (date) {
      const start: Date = new Date(date);
      const end: Date = new Date(date);

      if (time?.startTime && time?.endTime) {
        const [startHour, startMinute] = time.startTime.split(':').map(Number);
        const [endHour, endMinute] = time.endTime.split(':').map(Number);
        start.setHours(startHour, startMinute, 0, 0);
        end.setHours(endHour, endMinute, 59, 999);
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

    if (count) {
      queryConstraints.push(limit(count));
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'transactions'), ...queryConstraints),
      async (querySnapshot) => {
        const transactionsData = await Promise.all(
          querySnapshot.docs.map(async (transactionDoc) => {
            const transactionData = {
              ...transactionDoc.data(),
              id: transactionDoc.id,
            } as Transaction;

            // 🧠 Fetch orders
            const orderPromises = (transactionData.orderIds || []).map(
              async (orderId) => {
                const orderSnap = await getDoc(doc(db, 'orders', orderId));
                if (!orderSnap.exists()) return null;

                return {
                  id: orderId,
                  ...orderSnap.data(),
                } as Order;
              },
            );

            const orders = (await Promise.all(orderPromises)).filter(
              Boolean,
            ) as Order[];

            transactionData.orders = orders;
            return transactionData;
          }),
        );

        setTransactions(transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Snapshot error:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [
    store,
    status,
    onlyPending,
    sort,
    date,
    date2,
    time,
    paymentMethod,
    count,
  ]);

  return { transactions, loading };
};

export default useTransactions;
