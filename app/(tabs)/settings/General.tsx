import { ChevronRightIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Separator } from '~/components/ui/separator';
import { useAuth } from '~/context/AuthUserContext';

export default function General() {
  const { user, store } = useAuth();

  return (
    <>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">
          Account Information
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Full Name
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {user?.name}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
          <Separator className="bg-[#22262F]" />
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Phone
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {user?.phone}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">
          Business Information
        </Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Business Name
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.name}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
          <Separator className="bg-[#22262F]" />
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Email Address
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.email}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
          <Separator className="bg-[#22262F]" />
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Business Address
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.address}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
          <Separator className="bg-[#22262F]" />
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Mobile Number
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.phone}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
          <Separator className="bg-[#22262F]" />
          <TouchableOpacity className="gap-1">
            <Text className="font-OnestMedium text-xs text-[#CECFD2]">
              Tax Identification Number (TIN)
            </Text>
            <Text className="font-OnestSemiBold text-base text-[#F7F7F7]">
              {store?.tin}
            </Text>
            <View className="absolute bottom-0 right-0 top-0">
              <ChevronRightIcon color="#CECFD2" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-2">
        <Text className="font-OnestSemiBold text-[#F7F7F7]">Appearance</Text>
        <View className="gap-2 rounded-xl border border-[#22262F] bg-[#13161B] p-3">
          <TouchableOpacity className="flex-row gap-3 rounded-xl border-2 border-[#C2F93A] bg-[#0C0E12] p-4">
            <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
              <Path
                d="M0 12C0 6.47715 4.47715 2 10 2C15.5228 2 20 6.47715 20 12C20 17.5228 15.5228 22 10 22C4.47715 22 0 17.5228 0 12Z"
                fill="#78B300"
              />
              <Path
                d="M6 12C6 9.79086 7.79086 8 10 8C12.2091 8 14 9.79086 14 12C14 14.2091 12.2091 16 10 16C7.79086 16 6 14.2091 6 12Z"
                fill="white"
              />
            </Svg>
            <View className="gap-0.5">
              <Text className="font-OnestMedium text-[#CECFD2]">Dark mode</Text>
              <Text className="font-OnestRegular text-[#94979C]">
                Always use dark mode
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row gap-3 rounded-xl border border-[#22262F] bg-[#0C0E12] p-4 disabled:opacity-40"
            disabled>
            <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
              <Path
                d="M10 2.5C15.2467 2.5 19.5 6.7533 19.5 12C19.5 17.2467 15.2467 21.5 10 21.5C4.7533 21.5 0.5 17.2467 0.5 12C0.5 6.7533 4.7533 2.5 10 2.5Z"
                stroke="#373A41"
              />
            </Svg>
            <View className="gap-0.5">
              <Text className="font-OnestMedium text-[#CECFD2]">
                Light mode
              </Text>
              <Text className="font-OnestRegular text-[#94979C]">
                Always use light mode
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row gap-3 rounded-xl border border-[#22262F] bg-[#0C0E12] p-4 disabled:opacity-40"
            disabled>
            <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
              <Path
                d="M10 2.5C15.2467 2.5 19.5 6.7533 19.5 12C19.5 17.2467 15.2467 21.5 10 21.5C4.7533 21.5 0.5 17.2467 0.5 12C0.5 6.7533 4.7533 2.5 10 2.5Z"
                stroke="#373A41"
              />
            </Svg>
            <View className="gap-0.5">
              <Text className="font-OnestMedium text-[#CECFD2]">System</Text>
              <Text className="font-OnestRegular text-[#94979C]">
                Set to system default
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
