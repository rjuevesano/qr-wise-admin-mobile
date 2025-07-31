import { router, useFocusEffect } from 'expo-router';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ChevronRightIcon, PlusIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';
import { useAuth } from '~/context/AuthUserContext';
import { useSnackbar } from '~/context/SnackbarContext';
import { db } from '~/lib/firebase';
import { cn } from '~/lib/utils';
import { Discount } from '~/types';

export default function Tax() {
  const { store } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [discounts, setDiscounts] = useState<Discount[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (store?.discounts) {
        setDiscounts(store.discounts);
      }
    }, [store]),
  );

  async function updateDiscountSpecial(discount: Discount, isSpecial: boolean) {
    const ref = doc(db, 'stores', store?.id!);
    const updatedDiscounts = discounts.map((i) => ({
      ...i,
      isSpecial: i.id === discount.id ? isSpecial : i.isSpecial,
    }));

    await updateDoc(ref, {
      discounts: updatedDiscounts,
      updatedAt: serverTimestamp(),
    });

    setDiscounts(updatedDiscounts);
    showSnackbar('Changes successfully saved!');
  }

  return (
    <>
      <View className="gap-2">
        <Text className="text-default-primary font-OnestSemiBold">
          Value Added Tax
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity
            onPress={() => showSnackbar('Contact support to change VAT')}
            className="gap-1">
            <Text className="text-default-secondary font-OnestMedium text-xs">
              Tax %
            </Text>
            <Text className="text-default-primary font-OnestSemiBold text-base">
              {store?.vatTaxPercentage}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-default-primary font-OnestSemiBold">
          Service Charge
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/update-info?id=${store?.id}&value=${store?.serviceChargePercentage}&label=Service Charge&label2=Tax %&key=serviceChargePercentage&collection=stores`,
              )
            }
            className="gap-1">
            <Text className="text-default-secondary font-OnestMedium text-xs">
              Tax %
            </Text>
            <Text className="text-default-primary font-OnestSemiBold text-base">
              {store?.serviceChargePercentage}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-default-primary font-OnestSemiBold">
          To Go Charge
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/update-info?id=${store?.id}&value=${store?.togoCharge}&label=To Go Charge&label2=Charge (PHP)&key=togoCharge&collection=stores`,
              )
            }
            className="gap-1">
            <Text className="text-default-secondary font-OnestMedium text-xs">
              Charge (PHP)
            </Text>
            <Text className="text-default-primary font-OnestSemiBold text-base">
              {store?.togoCharge}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-default-primary font-OnestSemiBold">
          Discounts
        </Text>
        {discounts.map((discount) => (
          <View
            key={discount.id}
            className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-default-secondary font-OnestMedium text-sm">
                  Less VAT
                </Text>
                <Switch
                  className={cn(discount.isSpecial && 'bg-[#78B300]')}
                  checked={discount.isSpecial}
                  onCheckedChange={(checked) =>
                    updateDiscountSpecial(discount, checked)
                  }
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/add-edit-discount?discountId=${discount.id}`)
                }>
                <ChevronRightIcon color="#CECFD2" />
              </TouchableOpacity>
            </View>
            <View className="gap-1">
              <Text className="text-default-secondary font-OnestMedium text-xs">
                Discount Type
              </Text>
              <Text className="text-default-primary font-OnestSemiBold text-base">
                {discount.type}
              </Text>
            </View>
            <Separator className="bg-[#22262F]" />
            <View className="gap-1">
              <Text className="text-default-secondary font-OnestMedium text-xs">
                Discount Rate (%)
              </Text>
              <Text className="text-default-primary font-OnestSemiBold text-base">
                {discount.rate}
              </Text>
            </View>
          </View>
        ))}
        <Button
          onPress={() => router.push('/add-edit-discount')}
          className="flex-row items-center gap-1 border border-[#373A41] bg-[#0C0E12]">
          <PlusIcon color="#61656C" size="20" />
          <Text className="text-default-secondary">Add Another Discount</Text>
        </Button>
      </View>
    </>
  );
}
