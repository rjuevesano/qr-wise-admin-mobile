import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export default function BottomSheet({
  isOpen,
  toggleSheet,
  duration = 500,
  children,
}: {
  isOpen: any;
  toggleSheet: any;
  duration?: number;
  children: any;
}) {
  const height = useSharedValue(0);
  const translateY = useSharedValue(0);

  const progress = useDerivedValue(() =>
    withTiming(isOpen.value ? 0 : 1, { duration }),
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * 2 * height.value + translateY.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    zIndex: isOpen.value
      ? 1
      : withDelay(duration, withTiming(-1, { duration: 0 })),
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > height.value * 0.25) {
        runOnJS(toggleSheet)(); // swipe down to close
      }
      translateY.value = withTiming(0); // reset
    });

  return (
    <>
      <Animated.View style={[sheetStyles.backdrop, backdropStyle]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={toggleSheet} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          onLayout={(e) => {
            height.value = e.nativeEvent.layout.height;
          }}
          style={[
            sheetStyles.sheet,
            sheetStyle,
            { backgroundColor: '#13161B' },
          ]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const sheetStyles = StyleSheet.create({
  sheet: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
