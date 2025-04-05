import Colors from '@/constants/Colors';
import { Text, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';

const PredefinedMessages = [
  { title: 'Explica React Native', text: 'como si tuviera cinco años' },
  { title: 'Sugiéreme actividades divertidas', text: 'para una familia visitando Madrid' },
  { title: 'Recomienda un plato', text: 'para impresionar a una cita que es muy selectiva con la comida' },
];


type Props = {
  onSelectCard: (message: string) => void;
};

const MessageIdeas = ({ onSelectCard }: Props) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 16,
        }}>
        {PredefinedMessages.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => onSelectCard(`${item.title} ${item.text}`)}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
            <Text style={{ color: Colors.grey, fontSize: 14 }}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.input,
    padding: 14,
    borderRadius: 10,
  },
});
export default MessageIdeas;
