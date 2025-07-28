import { createContext, useCallback, useContext, useState } from 'react';
import Snackbar from '~/components/Snackbar';

type SnackbarContextType = {
  showSnackbar: (message: string, duration?: number) => void;
};

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = useCallback((msg: string, dur = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        message={message}
        onClose={handleClose}
        duration={duration}
      />
    </SnackbarContext.Provider>
  );
}
