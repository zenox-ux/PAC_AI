import Colors from '@/constants/Colors';
import { copyImageToClipboard, downloadAndSaveImage, shareImage } from '@/utils/Image';
import { Message, Role } from '@/utils/Interfaces';
import { Link } from 'expo-router';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';

const ChatMessage = ({
  content,
  role,
  imageUrl,
  prompt,
  loading,
}: Message & { loading?: boolean }) => {
  const contextItems = [
    { title: 'Copy', systemIcon: 'doc.on.doc', action: () => copyImageToClipboard(imageUrl!) },
    {
      title: 'Save to Photos',
      systemIcon: 'arrow.down.to.line',
      action: () => downloadAndSaveImage(imageUrl!),
    },
    { title: 'Share', systemIcon: 'square.and.arrow.up', action: () => shareImage(imageUrl!) },
  ];

  // Function to format content: Convert **text** into bold headings
  const formatText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g); // Splitting on **text**
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <Text key={index} style={styles.boldText}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  return (
    <View style={styles.row}>
      {role === Role.Bot ? (
        <View style={[styles.item]}>
          <Image source={require('@/assets/images/pac_icon.png')} style={styles.btnImage} />
        </View>
      ) : (
        <Image source={require('@/assets/images/pac_icon.png')} style={styles.avatar} />
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} size="small" />
        </View>
      ) : (
        <>
          {content === '' && imageUrl ? (
            <ContextMenu.Root>
              <ContextMenu.Trigger>
                <Link
                  href={`/(auth)/(modal)/image/${encodeURIComponent(
                    imageUrl
                  )}?prompt=${encodeURIComponent(prompt!)}`}
                  asChild>
                  <Pressable>
                    <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                  </Pressable>
                </Link>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                {contextItems.map((item, index) => (
                  <ContextMenu.Item key={item.title} onSelect={item.action}>
                    <ContextMenu.ItemTitle><Text>{item.title}</Text></ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                      ios={{
                        name: item.systemIcon,
                        pointSize: 18,
                      }}
                    />
                  </ContextMenu.Item>
                ))}
              </ContextMenu.Content>
            </ContextMenu.Root>
          ) : (
            <View style={styles.messageBox}>
              <Text style={styles.text}>{formatText(content)}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    gap: 14,
    marginVertical: 12,
  },
  item: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
  },
  messageBox: {
    backgroundColor: '#F5F5F5', // Light grey background
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  text: {
    fontSize: 16,
    flexWrap: 'wrap',
    flex: 1,
    color: '#000',
  },
  boldText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
  loading: {
    justifyContent: 'center',
    height: 26,
    marginLeft: 14,
  },
});

export default ChatMessage;
