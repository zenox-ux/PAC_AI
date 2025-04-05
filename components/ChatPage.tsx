
import HeaderDropDown from '@/components/HeaderDropDown';
import MessageInput from '@/components/MessageInput';
import { defaultStyles } from '@/constants/Styles';
import { keyStorage, storage } from '@/utils/Storage';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import axios from 'axios';
import { FlashList } from '@shopify/flash-list';
import ChatMessage from '@/components/ChatMessage';
import { Message, Role } from '@/utils/Interfaces';
import MessageIdeas from '@/components/MessageIdeas';
import { addChat, addMessage, getMessages, getOrCreateUserId } from '@/utils/Database';
import { useUser } from '@clerk/clerk-expo'; // Import useUser from Clerk
const DEEPSEEK_API_URL ="https://api.deepseek.com/chat/completions" ;
const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_API_KEY = "sk-9e64c500559a421bbb7af08b9fe96f2c";
console.log('DEEPSEEK_API_URL:', DEEPSEEK_API_URL);
console.log('DEEPSEEK_MODEL:', DEEPSEEK_MODEL);
console.log('DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY);


const ChatPage = () => {
  const [height, setHeight] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);  let { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoaded } = useUser(); // Get the authenticated user from Clerk
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null); // Change: Added to store Supabase user ID fetched via email

  // Change: Fetch or create Supabase user ID based on Clerk email instead of relying on a store or local DB
  useEffect(() => {
    const fetchUserId = async () => {
      if (isLoaded && user) {
        try {
          const userId = await getOrCreateUserId(user.primaryEmailAddress!.emailAddress);
          setSupabaseUserId(userId);
          console.log('supabaseUserId in the use effect of chatpage:', userId);
        } catch (error) {
          console.error('Error fetching/creating user ID:', error);
        }
      }
    };
    fetchUserId();
  }, [isLoaded, user]);


  if (!DEEPSEEK_API_KEY) {
    return <Redirect href={'/(auth)/(modal)/settings'} />;
  }
  console.log('User Email in the chat page:', user?.primaryEmailAddress?.emailAddress);
  const [chatId, _setChatId] = useState(id);
  const chatIdRef = useRef(chatId);

  function setChatId(id: string) {
    chatIdRef.current = id;
    _setChatId(id);
  }

  useEffect(() => {
    if (id) {
      getMessages(id).then((res) => {
        setMessages(res);
        console.log('Messages fetched for chatId:', id);
      }).catch((error) => {
        console.error('Error fetching messages:', error);
      });
    }
  }, [id]);



  const getCompletion = async (text: string) => {
    if (messages.length === 0) {
      try {
        // Change: Use Supabase addChat with supabaseUserId instead of SQLite, adapted to return UUID
        const res = await addChat(supabaseUserId, text);
        const chatID = res.lastInsertRowId; // Note: This is now a UUID string
        setChatId(chatID.toString());
        // Change: Add message to Supabase instead of SQLite
        await addMessage(chatID, { content: text, role: Role.User });
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    }

    // Add only the user message first
    setMessages((prevMessages) => [...prevMessages, { role: Role.User, content: text }]);

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL,
          messages: [{ role: 'user', content: text + " Give the response in Spanish." }],
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
        }
      );

      const botMessage = response.data.choices[0].message.content;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: Role.Bot, content: botMessage },
      ]);

      // Change: Add bot message to Supabase instead of SQLite
      await addMessage(chatIdRef.current!, {
        content: botMessage,
        role: Role.Bot,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch response from DeepSeek.');
      console.error('DeepSeek API Error:', error);
    }
  };
  
  return (
<View style={defaultStyles.pageContainer}>
  <Stack.Screen
    options={{
      headerTitle: 'PAC AI Chat',
      headerTitleAlign: 'center', // Centers the text
      headerStyle: {
        backgroundColor: '#E6D0F7', // Sets the background color
      },
      headerTitleStyle: {
        fontWeight: 'bold', // Optional: Make the text bold
        fontSize: 18, // Optional: Adjust font size
        color: '#000', // Optional: Set text color
      },
    }}
  />

      <View style={styles.page}>
        {messages.length == 0 && (
          <View style={[styles.logoContainer]}>
            <Image source={require('@/assets/images/pac_icon.png')} style={styles.image} />
          </View>
        )}
        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 150 }}
          keyboardDismissMode="on-drag"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={70}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
        }}>
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: "#E6D0F7",
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    borderRadius: 25,
  },
  page: {
    flex: 1,
    backgroundColor: "#E6D0F7"
  },
});
export default ChatPage;



















