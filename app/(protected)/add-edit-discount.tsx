import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import uuid from 'react-native-uuid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { useAuth } from '~/context/AuthUserContext';
import { useSnackbar } from '~/context/SnackbarContext';
import { db } from '~/lib/firebase';
import { cn } from '~/lib/utils';
import { Discount } from '~/types';

export default function AddEditDiscountScreen() {
  const { store, getStore } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { discountId } = useLocalSearchParams<{ discountId: string }>();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discount, setDiscount] = useState<Discount>();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (store?.discounts) {
        const discount = store.discounts.find((i) => i.id === discountId) ?? {
          id: uuid.v4(),
          type: '',
          rate: '',
          isSpecial: false,
        };
        console.log('==', discount);
        setDiscount(discount);
        setDiscounts(store.discounts);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store]),
  );

  const onPressSave = async () => {
    setLoading(true);

    const ref = doc(db, 'stores', store?.id!);
    const updatedDiscounts = [...discounts, discount];

    await updateDoc(ref, {
      discounts: updatedDiscounts,
      updatedAt: serverTimestamp(),
    });

    getStore(store?.id);
    showSnackbar('Discount added successfully!');
    setLoading(false);
    router.back();
  };

  const onPressDelete = async () => {
    setDeleteLoading(true);

    const ref = doc(db, 'stores', store?.id!);
    const updatedDiscounts = [...discounts].filter((i) => i.id !== discountId);

    await updateDoc(ref, {
      discounts: updatedDiscounts,
      updatedAt: serverTimestamp(),
    });

    getStore(store?.id);
    showSnackbar('Discount deleted successfully!');
    setDeleteLoading(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0C0E12]">
      <SafeAreaView className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 32 }}
            enableOnAndroid
            extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
            keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center justify-between px-4 py-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="size-10 items-center justify-center">
                <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <Path
                    d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
                    fill="#22262F"
                  />
                  <Path
                    d="M21.8332 15.9998H10.1665M10.1665 15.9998L15.9998 21.8332M10.1665 15.9998L15.9998 10.1665"
                    stroke="#CECFD2"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <Text />
              <View className="size-10" />
            </View>
            <View className="mt-5 gap-4 px-4">
              <Text className="font-OnestSemiBold text-2xl text-[#94979C]">
                {discountId ? 'Update Discount' : 'Add Another Discount'}
              </Text>
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-OnestMedium text-[#CECFD2]">
                    Less VAT
                  </Text>
                  <Switch
                    className={cn(discount?.isSpecial && 'bg-[#78B300]')}
                    checked={!!discount?.isSpecial}
                    onCheckedChange={(checked) =>
                      discount &&
                      setDiscount({ ...discount, isSpecial: checked })
                    }
                  />
                </View>
              </View>
              <View className="gap-1.5">
                <Text className="font-OnestMedium text-[#CECFD2]">
                  Discount Type
                </Text>
                <Input
                  value={discount?.type}
                  onChangeText={(text) =>
                    discount && setDiscount({ ...discount, type: text })
                  }
                />
              </View>
              <View className="gap-1.5">
                <Text className="font-OnestMedium text-[#CECFD2]">
                  Discount Rate (%)
                </Text>
                <Input
                  value={discount?.rate}
                  onChangeText={(text) =>
                    discount && setDiscount({ ...discount, rate: text })
                  }
                  inputMode="numeric"
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
        {discountId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mx-4 mb-4 h-14 border-[#F04438]"
                disabled={deleteLoading}>
                {deleteLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-OnestSemiBold text-[#F04438]">
                    Delete
                  </Text>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-OnestRegular">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-OnestRegular">
                  This action cannot be undone. This will permanently delete
                  your discount and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text className="font-OnestRegular text-white">Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction onPress={onPressDelete}>
                  <Text className="font-OnestRegular">Continue</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button
          onPress={onPressSave}
          className="mx-4 mb-10 h-14 bg-[#78B300]"
          disabled={
            loading ||
            (discount?.type || '').trim().length === 0 ||
            (discount?.rate || '').trim().length === 0
          }>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-OnestSemiBold text-white">Save</Text>
          )}
        </Button>
      </SafeAreaView>
    </View>
  );
}
