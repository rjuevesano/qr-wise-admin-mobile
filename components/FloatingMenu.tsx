import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { cn } from '~/lib/utils';

const actions = [
  {
    label: 'AI Search',
    icon: (
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="24" r="24" fill="white" />
        <Path
          d="M24 14L25.3015 19.206C25.5555 20.2218 25.6824 20.7298 25.9469 21.1431C26.1808 21.5087 26.4913 21.8192 26.8569 22.0531C27.2702 22.3176 27.7782 22.4445 28.794 22.6985L34 24L28.794 25.3015C27.7782 25.5555 27.2702 25.6824 26.8569 25.9469C26.4913 26.1808 26.1808 26.4913 25.9469 26.8569C25.6824 27.2702 25.5555 27.7782 25.3015 28.794L24 34L22.6985 28.794C22.4445 27.7782 22.3176 27.2702 22.0531 26.8569C21.8192 26.4913 21.5087 26.1808 21.1431 25.9469C20.7298 25.6824 20.2218 25.5555 19.206 25.3015L14 24L19.206 22.6985C20.2218 22.4445 20.7298 22.3176 21.1431 22.0531C21.5087 21.8192 21.8192 21.5087 22.0531 21.1431C22.3176 20.7298 22.4445 20.2218 22.6985 19.206L24 14Z"
          fill="#181D27"
        />
        <Path
          d="M24 14L25.3015 19.206C25.5555 20.2218 25.6824 20.7298 25.9469 21.1431C26.1808 21.5087 26.4913 21.8192 26.8569 22.0531C27.2702 22.3176 27.7782 22.4445 28.794 22.6985L34 24L28.794 25.3015C27.7782 25.5555 27.2702 25.6824 26.8569 25.9469C26.4913 26.1808 26.1808 26.4913 25.9469 26.8569C25.6824 27.2702 25.5555 27.7782 25.3015 28.794L24 34L22.6985 28.794C22.4445 27.7782 22.3176 27.2702 22.0531 26.8569C21.8192 26.4913 21.5087 26.1808 21.1431 25.9469C20.7298 25.6824 20.2218 25.5555 19.206 25.3015L14 24L19.206 22.6985C20.2218 22.4445 20.7298 22.3176 21.1431 22.0531C21.5087 21.8192 21.8192 21.5087 22.0531 21.1431C22.3176 20.7298 22.4445 20.2218 22.6985 19.206L24 14Z"
          fill="#181D27"
        />
        <Path
          d="M24 14L25.3015 19.206C25.5555 20.2218 25.6824 20.7298 25.9469 21.1431C26.1808 21.5087 26.4913 21.8192 26.8569 22.0531C27.2702 22.3176 27.7782 22.4445 28.794 22.6985L34 24L28.794 25.3015C27.7782 25.5555 27.2702 25.6824 26.8569 25.9469C26.4913 26.1808 26.1808 26.4913 25.9469 26.8569C25.6824 27.2702 25.5555 27.7782 25.3015 28.794L24 34L22.6985 28.794C22.4445 27.7782 22.3176 27.2702 22.0531 26.8569C21.8192 26.4913 21.5087 26.1808 21.1431 25.9469C20.7298 25.6824 20.2218 25.5555 19.206 25.3015L14 24L19.206 22.6985C20.2218 22.4445 20.7298 22.3176 21.1431 22.0531C21.5087 21.8192 21.8192 21.5087 22.0531 21.1431C22.3176 20.7298 22.4445 20.2218 22.6985 19.206L24 14Z"
          stroke="#181D27"
          strokeWidth="1.71429"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M24 14L25.3015 19.206C25.5555 20.2218 25.6824 20.7298 25.9469 21.1431C26.1808 21.5087 26.4913 21.8192 26.8569 22.0531C27.2702 22.3176 27.7782 22.4445 28.794 22.6985L34 24L28.794 25.3015C27.7782 25.5555 27.2702 25.6824 26.8569 25.9469C26.4913 26.1808 26.1808 26.4913 25.9469 26.8569C25.6824 27.2702 25.5555 27.7782 25.3015 28.794L24 34L22.6985 28.794C22.4445 27.7782 22.3176 27.2702 22.0531 26.8569C21.8192 26.4913 21.5087 26.1808 21.1431 25.9469C20.7298 25.6824 20.2218 25.5555 19.206 25.3015L14 24L19.206 22.6985C20.2218 22.4445 20.7298 22.3176 21.1431 22.0531C21.5087 21.8192 21.8192 21.5087 22.0531 21.1431C22.3176 20.7298 22.4445 20.2218 22.6985 19.206L24 14Z"
          stroke="#181D27"
          strokeWidth="1.71429"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    key: 'search',
  },
  {
    label: 'Add Notes',
    icon: (
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="24" r="24" fill="white" />
        <Path
          d="M33.4749 14.5251C34.8417 15.892 34.8417 18.108 33.4749 19.4749C32.108 20.8417 29.892 20.8417 28.5251 19.4749C27.1583 18.108 27.1583 15.892 28.5251 14.5251C29.892 13.1583 32.108 13.1583 33.4749 14.5251Z"
          fill="#181D27"
        />
        <Path
          d="M22.8333 14.6667H19.1C17.1398 14.6667 16.1597 14.6667 15.411 15.0481C14.7525 15.3837 14.217 15.9191 13.8815 16.5777C13.5 17.3264 13.5 18.3065 13.5 20.2667V28.9C13.5 30.8602 13.5 31.8403 13.8815 32.589C14.217 33.2475 14.7525 33.783 15.411 34.1185C16.1597 34.5 17.1398 34.5 19.1 34.5H27.7333C29.6935 34.5 30.6736 34.5 31.4223 34.1185C32.0809 33.783 32.6163 33.2475 32.9519 32.589C33.3333 31.8403 33.3333 30.8602 33.3333 28.9V25.1667M25.1667 29.8333H18.1667M27.5 25.1667H18.1667M33.4749 14.5251C34.8417 15.892 34.8417 18.108 33.4749 19.4749C32.108 20.8417 29.892 20.8417 28.5251 19.4749C27.1583 18.108 27.1583 15.892 28.5251 14.5251C29.892 13.1583 32.108 13.1583 33.4749 14.5251Z"
          stroke="#181D27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    key: 'notes',
  },
  {
    label: 'Add/Edit Upsell Banner',
    icon: (
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="24" r="24" fill="white" />
        <Path
          d="M32.1665 12.333L28.6665 15.833V19.333H32.1665L35.6665 15.833L33.3332 14.6663L32.1665 12.333Z"
          fill="#181D27"
        />
        <Path
          d="M28.6665 19.333L23.9999 23.9996L28.6665 19.333Z"
          fill="#181D27"
        />
        <Path
          d="M28.6665 19.333V15.833L32.1665 12.333L33.3332 14.6663L35.6665 15.833L32.1665 19.333H28.6665ZM28.6665 19.333L23.9999 23.9996M35.6666 23.9997C35.6666 30.443 30.4432 35.6663 23.9999 35.6663C17.5566 35.6663 12.3333 30.443 12.3333 23.9997C12.3333 17.5564 17.5566 12.333 23.9999 12.333M29.8333 23.9997C29.8333 27.2213 27.2216 29.833 23.9999 29.833C20.7783 29.833 18.1666 27.2213 18.1666 23.9997C18.1666 20.778 20.7783 18.1663 23.9999 18.1663"
          stroke="#181D27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    key: 'banner',
  },
  {
    label: 'Toggle On/Off Item',
    icon: (
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="24" r="24" fill="white" />
        <Path
          d="M18.1666 29.8337C21.3882 29.8337 23.9999 27.222 23.9999 24.0003C23.9999 20.7787 21.3882 18.167 18.1666 18.167C14.9449 18.167 12.3333 20.7787 12.3333 24.0003C12.3333 27.222 14.9449 29.8337 18.1666 29.8337Z"
          fill="#181D27"
        />
        <Path
          d="M21.6672 28.667H30.9999C33.5772 28.667 35.6666 26.5777 35.6666 24.0003C35.6666 21.423 33.5772 19.3337 30.9999 19.3337H21.6672M23.9999 24.0003C23.9999 27.222 21.3882 29.8337 18.1666 29.8337C14.9449 29.8337 12.3333 27.222 12.3333 24.0003C12.3333 20.7787 14.9449 18.167 18.1666 18.167C21.3882 18.167 23.9999 20.7787 23.9999 24.0003Z"
          stroke="#181D27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    key: 'toggle',
  },
  {
    label: 'Add/Edit Menu',
    icon: (
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="24" r="24" fill="white" />
        <Path
          d="M13.3555 31.1346C13.4091 30.6522 13.4359 30.411 13.5088 30.1856C13.5736 29.9855 13.6651 29.7952 13.7808 29.6197C13.9113 29.4218 14.0829 29.2502 14.4261 28.907L29.8334 13.4997C31.1221 12.211 33.2114 12.211 34.5001 13.4997C35.7888 14.7884 35.7888 16.8777 34.5001 18.1664L19.0928 33.5737C18.7496 33.9169 18.5779 34.0885 18.3801 34.219C18.2046 34.3347 18.0143 34.4262 17.8142 34.4909C17.5888 34.5639 17.3476 34.5907 16.8652 34.6443L12.9167 35.083L13.3555 31.1346Z"
          stroke="#181D27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    key: 'menu',
  },
].reverse();

export default function FloatingMenu() {
  const animation = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    Animated.timing(animation, {
      toValue: open ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const handleAction = (key: string) => {
    console.log(`${key} selected`);
    if (key === 'search') {
      router.push('/ai');
    } else if (key === 'notes') {
      //
    } else if (key === 'banner') {
      //
    } else if (key === 'toggle') {
      //
    } else if (key === 'menu') {
      router.push('/menu');
    }
    toggleMenu(); // Auto-close
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* 🔘 Background overlay */}
      {open && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleMenu}
          style={styles.overlay}
        />
      )}
      <View style={styles.container}>
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(index + 1) * 60],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.actionContainer,
                {
                  transform: [{ translateY }],
                  opacity,
                },
              ]}>
              <TouchableOpacity
                className="w-[180px] flex-row items-center justify-end"
                onPress={() => handleAction(action.key)}
                activeOpacity={0.8}>
                <Text className="pr-5 font-OnestMedium text-sm text-white">
                  {action.label}
                </Text>
                <View style={styles.iconCircle}>{action.icon}</View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <TouchableOpacity
          className={cn(open ? 'bg-[#414651]' : 'bg-white')}
          style={styles.mainButton}
          onPress={toggleMenu}>
          <MaterialIcons
            name={open ? 'remove' : 'add'}
            size={28}
            color={open ? '#D5D7DA' : '#22262F'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark transparent background
    zIndex: 0,
  },
  container: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    alignItems: 'flex-end',
  },
  actionContainer: {
    position: 'absolute',
    right: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
    width: 210,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
