import { X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export type SnackbarType = 'success' | 'info' | 'error';

type SnackbarProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  type?: SnackbarType;
};

const backgroundColors: Record<SnackbarType, string> = {
  success: 'bg-[#47CD89]',
  info: 'bg-[#36BFFA]',
  error: 'bg-[#F97066]',
};

export default function Snackbar({
  visible,
  message,
  onClose,
  duration = 3000,
  type = 'success',
}: SnackbarProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  const bgColor = backgroundColors[type];

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ translateY: -100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: -100, opacity: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className={`absolute left-4 right-4 top-12 z-50 flex-row items-center justify-between rounded-xl ${bgColor} px-4 py-3`}>
          <Text className="flex-1 font-OnestRegular text-white">{message}</Text>
          <TouchableOpacity onPress={onClose} className="ml-4">
            <X color="white" size={18} />
          </TouchableOpacity>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
