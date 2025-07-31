import { useState } from 'react';
import {
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '~/lib/utils';
import General from './General';
import Tax from './Tax';

export default function SettingsScreen() {
  const [tab, setTab] = useState<'GENERAL' | 'TAX'>('GENERAL');

  return (
    <View className="flex-1 bg-[#0C0E12]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-1">
          <Text className="text-default-primary font-OnestSemiBold text-2xl">
            Settings
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 140,
              paddingHorizontal: 16,
              gap: 20,
            }}
            enableOnAndroid
            extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
            keyboardShouldPersistTaps="handled">
            <View className="mt-5 flex-row items-center justify-between rounded-lg border border-[#22262F]">
              <TouchableOpacity
                onPress={() => setTab('GENERAL')}
                className={cn(
                  'h-9 w-1/2 items-center justify-center',
                  tab === 'GENERAL' &&
                    'rounded-lg border border-[#373A41] bg-[#13161B]',
                )}>
                <Text
                  className={cn(
                    'text-default-tertiary font-OnestSemiBold',
                    tab === 'GENERAL' && 'text-default-secondary',
                  )}>
                  General
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTab('TAX')}
                className={cn(
                  'h-9 w-1/2 items-center justify-center',
                  tab === 'TAX' &&
                    'rounded-lg border border-[#373A41] bg-[#13161B]',
                )}>
                <Text
                  className={cn(
                    'text-default-tertiary font-OnestSemiBold',
                    tab === 'TAX' && 'text-default-secondary',
                  )}>
                  Tax & Discounts
                </Text>
              </TouchableOpacity>
            </View>
            {tab === 'GENERAL' && <General />}
            {tab === 'TAX' && <Tax />}
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
