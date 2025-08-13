import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { InteractionManager } from 'react-native';
import { db } from '~/lib/firebase';
import { AddOn, MenuItem, Order } from '~/types';
import { useAuth } from './AuthUserContext';

type OrdersContextType = {
  orders: Order[];
};

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
});

export const OrdersProvider = ({ children }: PropsWithChildren) => {
  const { store } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Load cached data immediately
  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem('@orders');
      if (cached) setOrders(JSON.parse(cached));
    })();
  }, []);

  // Step 1 — Live sync for *recent* orders
  useEffect(() => {
    if (!store) return;

    InteractionManager.runAfterInteractions(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ordersRef = collection(db, 'orders');
      const qRecent = query(
        ordersRef,
        where('storeId', '==', store.id),
        where('status', '==', 'COMPLETED'),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        orderBy('createdAt', 'desc'),
        limit(50), // only latest 50 for immediate UI
      );

      let writeTimer: NodeJS.Timeout | number | null = null;

      const unsubscribe = onSnapshot(qRecent, async (snapshot) => {
        const data = await Promise.all(
          snapshot.docs.map(async (orderDoc) => {
            const orderData = {
              ...(orderDoc.data() as Order),
              id: orderDoc.id,
            };

            if (orderData.addOnId && !orderData.addOn) {
              const addOnDocSnap = await getDoc(
                doc(db, 'add-ons', orderData.addOnId),
              );
              if (addOnDocSnap.exists()) {
                orderData.addOn = {
                  id: addOnDocSnap.id,
                  ...addOnDocSnap.data(),
                } as AddOn;
              }
            }

            if (orderData.menuId && !orderData.menu) {
              const menuDocSnap = await getDoc(
                doc(db, 'menu-items', orderData.menuId),
              );
              if (menuDocSnap.exists()) {
                orderData.menu = {
                  id: menuDocSnap.id,
                  ...menuDocSnap.data(),
                } as MenuItem;
              }
            }

            return orderData;
          }),
        );

        // Merge with current orders without duplicates
        setOrders((prev) => {
          const merged = [
            ...data,
            ...prev.filter((o) => !data.find((d) => d.id === o.id)),
          ];
          return merged;
        });

        // Throttle cache writes
        if (writeTimer) clearTimeout(writeTimer);
        writeTimer = setTimeout(() => {
          AsyncStorage.setItem('@orders', JSON.stringify(data));
        }, 500);
      });

      return unsubscribe;
    });
  }, [store]);

  // Step 2 — Background sync for older orders
  useEffect(() => {
    if (!store) return;

    let isCancelled = false;

    const fetchOlderOrders = async () => {
      const ordersRef = collection(db, 'orders');
      let lastDoc: QueryDocumentSnapshot<DocumentData> | undefined;

      while (!isCancelled) {
        const qOlder = lastDoc
          ? query(
              ordersRef,
              where('storeId', '==', store.id),
              where('status', '==', 'COMPLETED'),
              orderBy('createdAt', 'desc'),
              startAfter(lastDoc),
              limit(50),
            )
          : query(
              ordersRef,
              where('storeId', '==', store.id),
              where('status', '==', 'COMPLETED'),
              orderBy('createdAt', 'desc'),
              limit(50),
            );

        const snap = await getDocs(qOlder);
        if (snap.empty) break;

        const batch = await Promise.all(
          snap.docs.map(async (orderDoc) => {
            const orderData = {
              ...(orderDoc.data() as Order),
              id: orderDoc.id,
            };

            if (orderData.addOnId && !orderData.addOn) {
              const addOnDocSnap = await getDoc(
                doc(db, 'add-ons', orderData.addOnId),
              );
              if (addOnDocSnap.exists()) {
                orderData.addOn = {
                  id: addOnDocSnap.id,
                  ...addOnDocSnap.data(),
                } as AddOn;
              }
            }

            if (orderData.menuId && !orderData.menu) {
              const menuDocSnap = await getDoc(
                doc(db, 'menu-items', orderData.menuId),
              );
              if (menuDocSnap.exists()) {
                orderData.menu = {
                  id: menuDocSnap.id,
                  ...menuDocSnap.data(),
                } as MenuItem;
              }
            }

            return orderData;
          }),
        );

        // Merge quietly without blocking UI
        setOrders((prev) => {
          const merged = [
            ...prev,
            ...batch.filter((o) => !prev.find((p) => p.id === o.id)),
          ];
          AsyncStorage.setItem('@orders', JSON.stringify(merged)); // small batches won't freeze
          return merged;
        });

        lastDoc = snap.docs[snap.docs.length - 1];

        // Small delay to keep UI smooth
        await new Promise((res) => setTimeout(res, 300));
      }
    };

    InteractionManager.runAfterInteractions(() => {
      fetchOlderOrders();
    });

    return () => {
      isCancelled = true;
    };
  }, [store]);

  return (
    <OrdersContext.Provider value={{ orders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
