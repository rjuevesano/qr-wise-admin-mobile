import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { auth, db } from '~/lib/firebase';
import { Store, User } from '~/types';

type AuthContextType = {
  user: User | null | undefined;
  setUser: (user: User | null | undefined) => void;
  loginUser: (user: User) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  store: Store | null;
  getStore: (storeId?: string) => Promise<void>;
  isPremiumUser: boolean;
  setIsPremiumUser: (isPremiumUser: boolean) => void;
  openSheet: SharedValue<boolean>;
  toggleSheet: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {
    throw new Error();
  },
  loginUser: () => {
    throw new Error();
  },
  logoutUser: () => {
    throw new Error();
  },
  updateUser: () => {
    throw new Error();
  },
  store: null,
  getStore: () => {
    throw new Error();
  },
  isPremiumUser: false,
  setIsPremiumUser: () => {
    throw new Error();
  },
  openSheet: {} as SharedValue<boolean>,
  toggleSheet: () => {
    throw new Error();
  },
});

const SESSION_KEY = 'auth_session';

export function AuthProvider({ children }: PropsWithChildren) {
  const storeId = process.env.EXPO_PUBLIC_STORE_ID;

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [store, setStore] = useState<Store | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  const openSheet = useSharedValue<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Firebase auth state changed:', user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await SecureStore.getItemAsync(SESSION_KEY);
        if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!storeId) return;
    getStore();
  }, [storeId]);

  async function getStore(id?: string) {
    const storeSnapshot = await getDoc(doc(db, 'stores', id || storeId!));
    if (storeSnapshot.exists()) {
      setStore({
        id: storeSnapshot.id,
        ...storeSnapshot.data(),
      } as Store);
    }
  }

  async function loginUser(user: User) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
    setUser(user);
  }

  async function logoutUser() {
    await auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  }

  async function updateUser(updates: Partial<User>) {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    if (!stored) {
      throw new Error('No user data found');
    }

    const currentUser = JSON.parse(stored);
    const updatedUser = { ...currentUser, ...updates };

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  const toggleSheet = () => {
    openSheet.value = !openSheet.value;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loginUser,
      logoutUser,
      updateUser,
      store,
      getStore,
      isPremiumUser,
      setIsPremiumUser,
      openSheet,
      toggleSheet,
    }),
    [user, store, isPremiumUser, openSheet],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
