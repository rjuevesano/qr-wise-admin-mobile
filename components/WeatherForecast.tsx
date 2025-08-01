import { Droplet } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';
import { cn } from '~/lib/utils';

export interface WeatherType {
  current: DailyForecast;
  daily: DailyForecast[];
}

interface DailyForecast {
  dt: number; // Unix timestamp
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary?: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: number;
  pop: number; // Probability of precipitation (0 to 1)
  rain?: number; // Optional, mm
  uvi: number;
}

export default function DailyWeatherForecast({
  dailyData,
}: {
  dailyData: DailyForecast[];
}) {
  const getDay = (dt: number) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
    });
  };

  return (
    <View className="flex-row gap-5">
      {dailyData.slice(0, 10).map((day, index) => (
        <View
          key={index}
          className="w-20 flex-col items-end justify-between rounded-lg py-1 text-center hover:bg-neutral-200">
          {/* Day Label */}
          <Text
            className={cn(
              'text-default-secondary font-OnestMedium text-sm',
              index === 0 && 'font-OnestSemiBold',
            )}>
            {index === 0 ? 'Today' : getDay(day.dt)}
          </Text>
          {/* Icon + Temperature */}
          <View className="flex-row items-center gap-0.5">
            <Image
              source={{
                uri: `https://openweathermap.org/img/wn/${day.weather[0]?.icon || '01d'}@2x.png`,
              }}
              alt={day.weather[0]?.description}
              className="h-10 w-10"
            />
            <Text className="text-default-secondary font-OnestSemiBold text-lg">
              {Math.round(day.temp.max)}°
            </Text>
          </View>
          {/* Rain Probability */}
          <View className="flex-row items-center gap-1">
            <Droplet size="12" color="#94979C" />
            <Text className="text-default-tertiary mt-px font-OnestRegular text-xs">
              {Math.round(day.pop * 100)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
