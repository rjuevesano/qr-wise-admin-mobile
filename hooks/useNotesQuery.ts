import { useQuery } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { useAuth } from '~/context/AuthUserContext';
import { db } from '~/lib/firebase';
import { Note } from '~/types';

const fetchNotes = async ({
  storeId,
  date,
}: {
  storeId: string;
  date: Date;
}) => {
  const queryConstraints: QueryConstraint[] = [
    where('storeId', '==', storeId),
    orderBy('createdAt', 'asc'),
  ];

  if (date) {
    let start: Date = new Date(date);
    let end: Date = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    queryConstraints.push(
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
    );
  }

  const q = query(collection(db, 'notes'), ...queryConstraints);
  const querySnapshot = await getDocs(q);

  const notes = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const noteData = { ...docSnap.data(), id: docSnap.id } as Note;
      return noteData;
    }),
  );

  return notes;
};

export const useNotesQuery = (
  params: {
    date: Date;
  },
  key: string,
) => {
  const { store } = useAuth();

  return useQuery({
    queryKey: [key, store?.id, params],
    queryFn: () => fetchNotes({ storeId: store?.id!, ...params }),
    enabled: !!store?.id, // Only run if store is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
