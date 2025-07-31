import { X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';

type SnackbarProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
};

export default function Snackbar({
  visible,
  message,
  onClose,
  duration = 3000,
}: SnackbarProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer); // Clear on unmount or visibility change
  }, [visible, duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ translateY: 100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: 100, opacity: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="absolute bottom-12 left-4 right-4 z-50 flex-row items-center justify-between rounded-xl bg-black/90 px-4 py-3">
          <Text className="flex-1 font-OnestRegular text-white">{message}</Text>
          <TouchableOpacity onPress={onClose} className="ml-4">
            <X color="white" size={18} />
          </TouchableOpacity>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
