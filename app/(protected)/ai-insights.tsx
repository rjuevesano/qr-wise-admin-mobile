import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { MicIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  InteractionManager,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import TypeWriterEffect from 'react-native-typewriter-effect';
import { useAI } from '~/hooks/useAI';
import { Insight } from '~/types';

export default function AIInsightsScreen() {
  const { question } = useLocalSearchParams<{ question: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const scrolledMessagesRef = useRef<Set<number>>(new Set());
  const [results, setResults] = useState<Insight>();
  const [messages, setMessages] = useState<
    {
      type: 'user' | 'ai';
      content: string;
      chartType?: string;
      chartData?: {
        [key: string]: string | number;
      }[];
    }[]
  >([]);
  const [input, setInput] = useState<string>('');
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    insight,
    loading: insightLoading,
    chartType,
    chartData,
  } = useAI({
    data: results!,
  });

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue:
            e.endCoordinates.height + (Platform.OS === 'android' ? 15 : 0),
          duration: e.duration || 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.poly(4)),
        }).start();
      },
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.poly(4)),
        }).start();
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const id = keyboardOffset.addListener(({ value }) => {
      setKeyboardPadding(value);
    });

    return () => keyboardOffset.removeListener(id);
  }, [keyboardOffset]);

  // Initial question
  useEffect(() => {
    if (question?.length > 0) fetchInsights(question);
  }, [question]);

  // Submit follow-up
  useEffect(() => {
    if (isFollowUp && input.length > 0) {
      fetchInsights(input);
      setInput('');
      setIsFollowUp(false);
      Keyboard.dismiss();
    }
  }, [isFollowUp]);

  useEffect(() => {
    if (insight?.length > 0) {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', content: insight, chartType, chartData },
      ]);

      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      });
    }
  }, [insight]);

  const fetchInsights = async (q: string) => {
    setMessages((prev) => [...prev, { type: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_AI_HOSTED_URL! + '/query/summarized',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            include_chart: true,
            max_results: 100,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const record = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      Alert.alert('Permission to access microphone was denied');
      return;
    }

    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();

    if (audioRecorder.uri) {
      const transcript = await transcribeAudio(audioRecorder.uri);
      setInput((prev) => prev + (prev.length ? ' ' : '') + transcript);
    }
  };

  const transcribeAudio = async (uri: string): Promise<string> => {
    const file = {
      uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    };

    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('model', 'whisper-1');

    try {
      const res = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const json = await res.json();
      return json.text || '';
    } catch (err) {
      console.error('Transcription error', err);
      return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0E12]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
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
        <Text className="font-OnestSemiBold text-base text-white">Wise AI</Text>
        <View className="size-10" />
      </View>
      <View className="flex-1 rounded-t-2xl bg-[#13161B]">
        {/* Chat ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 140 + keyboardPadding,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled">
          {messages.map((msg, idx) => {
            const isUser = msg.type === 'user';

            // const barData = chartData?.flatMap((row) =>
            //   Object.entries(row).map(([label, value], index) => {
            //     const v = formatStringToNumber((value || 0).toString()) || 0;
            //     return {
            //       value: v,
            //       label,
            //       ...(index === 0 && { spacing: 6 }),
            //       ...(v > 0 && {
            //         topLabelComponent: () => (
            //           <Text className="-mb-5 text-xs text-[#22262F]">
            //             {v.toFixed(2)}
            //           </Text>
            //         ),
            //       }),
            //     };
            //   }),
            // );

            return (
              <View
                key={idx}
                className={`my-2 flex-row ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}>
                <View
                  className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    isUser ? 'bg-[#86E7F1]' : 'w-full bg-[#22262F]'
                  }`}>
                  {msg.type === 'ai' ? (
                    <>
                      {/* {chartData.length > 0 && (
                        <ScrollView
                          horizontal
                          contentContainerStyle={{
                            flex: 1,
                            width: '100%',
                            marginBottom: 20,
                          }}>
                          <BarChart
                            data={barData}
                            width={width / 2}
                            barWidth={50}
                            noOfSections={3}
                            frontColor={
                              barData.length % 2 === 0 ? '#36BFFA' : '#C2F93A'
                            }
                            barBorderRadius={4}
                            yAxisThickness={0}
                            yAxisTextStyle={{
                              color: '#F7F7F7',
                              fontSize: 12,
                              fontFamily: 'Onest-Regular',
                            }}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={{
                              color: '#F7F7F7',
                              fontSize: 12,
                              fontFamily: 'Onest-Regular',
                            }}
                          />
                        </ScrollView>
                      )} */}
                      <TypeWriterEffect
                        content={msg.content}
                        minDelay={5}
                        maxDelay={10}
                        style={{
                          color: '#F7F7F7',
                          fontSize: 16,
                          fontFamily: 'Onest-Regular',
                        }}
                        onTypingEnd={() => {
                          if (!scrolledMessagesRef.current.has(idx)) {
                            scrolledMessagesRef.current.add(idx);
                            scrollViewRef.current?.scrollToEnd({
                              animated: true,
                            });
                          }
                        }}
                      />
                    </>
                  ) : (
                    <Text className="font-OnestRegular text-base text-[#162736]">
                      {msg.content}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
          {(loading || insightLoading) && (
            <View className="mt-2 max-w-[75%] flex-row items-center gap-2 rounded-lg bg-[#22262F] px-4 py-3">
              <Text className="font-OnestRegular text-base text-default-tertiary">
                Thinking
              </Text>
              <View className="ml-2 flex-row gap-1">
                <View className="h-2 w-2 animate-bounce rounded-full bg-default-tertiary" />
                <View className="h-2 w-2 animate-bounce rounded-full bg-default-tertiary delay-100" />
                <View className="h-2 w-2 animate-bounce rounded-full bg-default-tertiary delay-200" />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      {/* Animated Input Bar */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: keyboardOffset,
        }}
        className="border-t border-[#22262F] bg-[#13161B] px-4 pb-6 pt-3">
        <View className="flex-row items-center rounded-full bg-[#1A1D23] px-4 py-2">
          <TextInput
            placeholder="Ask a follow-up..."
            placeholderTextColor="#94979C"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => setIsFollowUp(true)}
            returnKeyType="send"
            className="flex-1 font-OnestRegular text-base text-default-primary"
          />
          <View className="ml-2 flex-row items-center gap-2">
            <TouchableOpacity
              onPress={recorderState.isRecording ? stopRecording : record}
              className="size-9 items-center justify-center">
              <MicIcon
                color={recorderState.isRecording ? '#FF5C5C' : '#FFFFFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFollowUp(true)}
              disabled={input.trim() === ''}>
              <Svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <Rect width="33" height="33" rx="16.5" fill="#86E7F1" />
                <Path
                  d="M17 22V10M17 10L21.5 14.5M17 10L12.5 14.5"
                  stroke="#162736"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
