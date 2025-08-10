import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '~/context/AuthUserContext';

export default function IndexRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;

    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/main');
    }
  }, [user]);

  return null;
}
