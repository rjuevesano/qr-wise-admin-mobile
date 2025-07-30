import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { cacheFileFromUrl } from '~/lib/cacheFileFromFirebase';

export default function PlaceholderImage({
  imageUrl,
  className,
}: {
  imageUrl: string;
  className?: string;
}) {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const uri = await cacheFileFromUrl(imageUrl);
        setLocalUri(uri);
      } catch {
        setLocalUri(imageUrl);
      }
    };
    load();
  }, [imageUrl]);

  return (
    <View className={`relative overflow-hidden ${className}`}>
      {!localUri ? (
        <View
          className={`absolute bottom-0 left-0 right-0 top-0 items-center justify-center border border-[#ddd] bg-white ${className}`}>
          <ActivityIndicator />
        </View>
      ) : (
        <Image
          source={{ uri: localUri }}
          className="absolute bottom-0 left-0 right-0 top-0"
        />
      )}
    </View>
  );
}
