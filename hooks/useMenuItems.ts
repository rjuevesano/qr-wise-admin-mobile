import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '~/context/AuthUserContext';
import { db } from '~/lib/firebase';
import { MenuItem } from '~/types';

const useMenuItems = ({ enabled = false }: { enabled: boolean }) => {
  const { store } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!store) return;

    setLoading(true);

    const queryConstraints: QueryConstraint[] = [
      where('storeId', '==', store.id),
    ];

    if (enabled) {
      queryConstraints.push(where('enabled', '==', true));
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'menu-items'), ...queryConstraints),
      async (querySnapshot) => {
        const menuItemsData = await Promise.all(
          querySnapshot.docs.map(async (menuItemDoc) => {
            const menuItemData = {
              ...menuItemDoc.data(),
              id: menuItemDoc.id,
            } as MenuItem;

            // Fetch options using the array of IDs
            const optionsData = await Promise.all(
              (menuItemData.options || []).map(async (optionId) => {
                const optionDocRef = doc(db, 'menu-group-options', optionId);
                const optionDocSnap = await getDoc(optionDocRef);
                return optionDocSnap.exists()
                  ? { ...optionDocSnap.data(), id: optionId }
                  : null;
              }),
            );

            return {
              ...menuItemData,
              optionsData,
            } as MenuItem;
          }),
        );

        setMenuItems(menuItemsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [store, enabled]);

  return { menuItems, loading };
};

export default useMenuItems;
