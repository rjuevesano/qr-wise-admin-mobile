import { useQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useAuth } from '~/context/AuthUserContext';
import { db } from '~/lib/firebase';
import { MenuItem } from '~/types';

const fetchMenuItems = async ({
  storeId,
  enabled = false,
}: {
  storeId: string;
  enabled: boolean;
}) => {
  const queryConstraints: QueryConstraint[] = [where('storeId', '==', storeId)];

  if (enabled) {
    queryConstraints.push(where('enabled', '==', true));
  }

  const q = query(collection(db, 'menu-items'), ...queryConstraints);
  const querySnapshot = await getDocs(q);

  const menuItems = await Promise.all(
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

  return menuItems;
};

export const useMenuItemsQuery = (
  params: {
    enabled: boolean;
  },
  key: string,
) => {
  const { store } = useAuth();
  return useQuery({
    queryKey: [key, store?.id, params],
    queryFn: () => fetchMenuItems({ storeId: store?.id!, ...params }),
    enabled: !!store?.id, // Only run if store is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
