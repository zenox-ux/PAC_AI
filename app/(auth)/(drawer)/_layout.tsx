import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Link, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';


import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Alert,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { getChats, renameChat, deleteChat, getOrCreateUserId,getSearchedChats } from '@/utils/Database'; // Change: Updated imports to use Supabase ';
import { useDrawerStatus } from '@react-navigation/drawer';
import { Chat } from '@/utils/Interfaces';
import { useRevenueCat } from '@/providers/RevenueCat';
import { Keyboard } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Change: Added useUser to get Clerk user's email

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const CustomDrawerContent = (props: any) => {
  const { bottom, top } = useSafeAreaInsets();
  const isDrawerOpen = useDrawerStatus() === 'open';
  const [history, setHistory] = useState<Chat[]>([]);
  const [visible, setVisible] = useState<string | null>(null);
  const { user, isLoaded } = useUser(); // Change: Added useUser to fetch email for Supabase user ID
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null); // Change: Added to store Supabase user ID
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false); // True if searchQuery is not empty
  const [searchQuery, setSearchQuery] = useState(''); // Tracks search input
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [loading, setLoading] = useState(false); // New state for loading


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setIsSearching(text.trim().length > 0); // Set isSearching based on input
  };

  useEffect(() => {
    const fetchUserId = async () => {
      if (isLoaded && user) {
        try {
          const userId = await getOrCreateUserId(user.primaryEmailAddress!.emailAddress);
          setSupabaseUserId(userId);
          console.log('supabaseUserId:', userId);
        } catch (error) {
          console.error('Error fetching/creating user ID:', error);
        }
      }
    };
    fetchUserId();
  }, [isLoaded, user]);

  const loadSearchedChats = async () => {
    if (!supabaseUserId || !debouncedSearchQuery) return;
    setLoading(true);
    try {
      const result = await getSearchedChats(supabaseUserId, debouncedSearchQuery);
      setHistory(result || []);
      console.log('Searched chats loaded:', result);
    } catch (error) {
      console.error('Error loading searched chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabaseUserId) {
      if (isSearching) {
        loadSearchedChats();
      } else {
        loadChats();
      }
    }
  }, [isDrawerOpen, supabaseUserId, debouncedSearchQuery]);

  const loadChats = async () => {
    if (!supabaseUserId) return;
    setLoading(true);
    try {
      const result = await getChats(supabaseUserId);
      setHistory(result || []);
      console.log('Chats loaded:', result);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteChat = (chatId: string) => { // Change: Changed chatId type to string (UUID) for Supabase
    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteChat(chatId); // Change: Use Supabase deleteChat function
            loadChats();
          } catch (error) {
            console.error('Error deleting chat:', error);
          }
        },
      },
    ]);
  };

  const onRenameChat = (chatId: string) => { // Change: Changed chatId type to string (UUID) for Supabase
    Alert.prompt('Rename Chat', 'Enter a new name for the chat', async (newName) => {
      if (newName) {
        try {
          await renameChat(chatId, newName); // Change: Use Supabase renameChat function
          loadChats();
        } catch (error) {
          console.error('Error renaming chat:', error);
        }
      }
    });
  };

  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View style={{ backgroundColor: '#fff', paddingBottom: 10 }}>
        <View style={styles.searchSection}>
          <Ionicons style={styles.searchIcon} name="search" size={20} color={Colors.greyLight} />
          <TextInput
            style={styles.input}
            placeholder="Search"
            underlineColorAndroid="transparent"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#fff' }}>
        <DrawerItemList {...props} />
 {loading ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <ActivityIndicator size="large" color="#6200EE" />
  </View>
) : history.length === 0 ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ color: '#000' }}>No chats available</Text>
  </View>
) : (history.map((chat) => (
    <View key={chat.id}>
      <Menu
        visible={visible === String(chat.id)} // Convert chat.id to string
        onDismiss={() => setVisible(null)}
        anchor={
      <DrawerItem
        label={chat.title}
        inactiveTintColor="#000"
        onPress={() => router.push(`/(auth)/(drawer)/(chat)/${chat.id}`)} // Move onPress here
      />
        }
      >
        <Menu.Item onPress={() => onRenameChat(String(chat.id))} title="Rename" /> {/* Convert chat.id to string */}
        <Menu.Item onPress={() => onDeleteChat(String(chat.id))} title="Delete" /> {/* Convert chat.id to string */}
      </Menu>
    </View>
  )))}
      </DrawerContentScrollView>

      <View
        style={{
          padding: 16,
          paddingBottom: 10 + bottom,
          backgroundColor: Colors.light,
        }}>
        <Link href="/(auth)/(modal)/settings" asChild>
          <TouchableOpacity style={styles.footer}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#3A0088', // Grey background
              borderRadius: 10, // Square with rounded corners
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
              {user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'G'}
            </Text>
          </View>
            <Text>{user?.primaryEmailAddress?.emailAddress || 'Guest'}</Text>   
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const Layout = () => {
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const { user } = useRevenueCat();
  const router = useRouter();

  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer)}
            style={{ marginLeft: 16 }}>
            <FontAwesome6 name="grip-lines" size={20} color={Colors.grey} />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: Colors.light,
        },
        headerShadowVisible: false,
        drawerActiveBackgroundColor: Colors.selected,
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: '#000',
        overlayColor: 'rgba(0, 0, 0, 0.2)',
        drawerItemStyle: { borderRadius: 12 },
        drawerLabelStyle: { marginLeft: -20 },
        drawerStyle: { width: dimensions.width * 0.86 },
      }}>
      <Drawer.Screen
        name="(chat)/new"
        getId={() => Math.random().toString()}
        options={{
          title: 'PAC AI',
          drawerIcon: () => (
            <View style={[styles.item, { backgroundColor: '#000' }]}>
              <Image source={require('@/assets/images/pac_icon.png')} style={styles.btnImage} />
            </View>
          ),
          headerRight: () => (
            <Link href={'/(auth)/(drawer)/(chat)/new'} push asChild>
              <TouchableOpacity>
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={Colors.grey}
                  style={{ marginRight: 16 }}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="(chat)/[id]"
        options={{
          drawerItemStyle: {
            display: 'none',
          },
          headerRight: () => (
            <Link href={'/(auth)/(drawer)/(chat)/new'} push asChild>
              <TouchableOpacity>
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={Colors.grey}
                  style={{ marginRight: 16 }}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore Agents',
          drawerIcon: () => (
            <View
              style={[
                styles.item,
                {
                  backgroundColor: '#fff',
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Ionicons name="apps-outline" size={18} color="#000" />
            </View>
          ),
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    marginHorizontal: 16,
    borderRadius: 10,
    height: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.input,

  },
  searchIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 9,
    paddingLeft: 0,
    alignItems: 'center',
    color: '#424242',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundImage: {
    width: 30,
    height: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  item: {
    width: 30, // Set the width of the circular container
    height: 30, // Set the height of the circular container
    borderRadius: 15, // Half of width/height to make it circular
    overflow: 'hidden', // Ensures the image doesn't overflow the container
    alignItems: 'center', // Center the image horizontally
    justifyContent: 'center', // Center the image vertically
    backgroundColor: 'transparent', // Remove any background color
  },
  btnImage: {
    width: '100%', // Make the image fill the container
    height: '100%', // Make the image fill the container
    borderRadius: 15, // Ensure the image is circular
    resizeMode: 'cover', // Scale the image to cover the container
  },
  dallEImage: {
    width: 28,
    height: 28,
    resizeMode: 'cover',
  },
});

export default Layout;
