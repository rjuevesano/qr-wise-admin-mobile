import { createContext, useCallback, useContext, useState } from 'react';
import Snackbar, { SnackbarType } from '~/components/Snackbar';

type SnackbarContextType = {
  showSnackbar: (params: {
    message: string;
    duration?: number;
    type?: SnackbarType;
  }) => void;
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
  const [type, setType] = useState<SnackbarType>('success');

  const showSnackbar = useCallback(
    ({
      message,
      duration = 3000,
      type = 'success',
    }: {
      message: string;
      duration?: number;
      type?: SnackbarType;
    }) => {
      setType(type);
      setMessage(message);
      setDuration(duration);
      setVisible(true);
    },
    [],
  );

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
        type={type}
      />
    </SnackbarContext.Provider>
  );
}
