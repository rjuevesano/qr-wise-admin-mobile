import { ChevronRightIcon, PlusIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';
import { useAuth } from '~/context/AuthUserContext';
import { cn } from '~/lib/utils';

export default function Tax() {
  const { store } = useAuth();

  return (
    <>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">
          Value Added Tax
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Tax %
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.vatTaxPercentage}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">
          Service Charge
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Tax %
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.serviceChargePercentage}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">To Go Charge</Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Charge (PHP)
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.togoCharge}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">Discounts</Text>
        {store?.discounts.map((discount) => (
          <View
            key={discount.id}
            className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-OnestMedium text-sm text-[#CECFD2]">
                  Less VAT
                </Text>
                <Switch
                  className={cn(discount.isSpecial && 'bg-[#78B300]')}
                  checked={discount.isSpecial}
                  onCheckedChange={() => console.log('checked')}
                />
              </View>
              <TouchableOpacity>
                <ChevronRightIcon color="#CECFD2" />
              </TouchableOpacity>
            </View>
            <View className="gap-1">
              <Text className="font-OnestMedium text-xs text-[#CECFD2]">
                Discount Type
              </Text>
              <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
                {discount.type}
              </Text>
            </View>
            <Separator className="bg-[#22262F]" />
            <View className="gap-1">
              <Text className="font-OnestMedium text-xs text-[#CECFD2]">
                Discount Rate (%)
              </Text>
              <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
                {discount.rate}
              </Text>
            </View>
          </View>
        ))}
        <Button className="flex-row items-center gap-1 border border-[#373A41] bg-[#0C0E12]">
          <PlusIcon color="#61656C" size="20" />
          <Text className="text-[#CECFD2]">Add Another Discount</Text>
        </Button>
      </View>
    </>
  );
}
