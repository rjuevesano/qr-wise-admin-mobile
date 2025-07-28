import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth, db } from '~/lib/firebase';
import { Store } from '~/types';

type AuthContextType = {
  user: User | null;
  store: Store | null;
  baseRoute: string;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  store: null,
  baseRoute: '',
});

export function AuthProvider({ children }: PropsWithChildren) {
  const storeId = '';

  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Firebase auth state changed:', user);

      if (!user) {
        setUser(null);
        return;
      }

      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!storeId) return;

    getStore();
  }, [storeId]);

  async function getStore() {
    const storeSnapshot = await getDoc(doc(db, 'stores', storeId!));
    if (storeSnapshot.exists()) {
      setStore({
        id: storeSnapshot.id,
        ...storeSnapshot.data(),
      } as Store);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, store, baseRoute: `/store/${store?.id}` }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
