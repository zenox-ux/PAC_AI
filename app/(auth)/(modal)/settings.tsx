import React from "react";
import { View, useColorScheme, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Menu, Divider } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { ScrollView } from "react-native-gesture-handler";
import { useUser } from '@clerk/clerk-expo';

const SettingsRoute = React.memo(() => {
    const colorScheme = useColorScheme() || 'light';
    const [menuIsVisible, setMenuIsVisible] = React.useState<boolean>(false);
    const { signOut } = useAuth();
    const { user, isLoaded } = useUser(); // Change: Added useUser to fetch email for Supabase user ID

    // Hardcoded colors based on colorScheme (light/dark)
    const colors = {
      background: colorScheme === 'dark' ? '#1C2526' : '#F5F5F5',
      text: '#000000', // Set to black
      boldText: '#000000', // Set to black
      lineColor: colorScheme === 'dark' ? '#3A4A4C' : '#D3D3D3',
      sectionBg: colorScheme === 'dark' ? '#2A3435' : '#FFFFFF',
  };

    // Sign out handler
    const handleSignOut = React.useCallback(() => {
        signOut();
    }, [signOut]);

    // Static close button handler (no navigation, just a placeholder)
    const handleClose = () => {
        console.log('Close button pressed - navigation not implemented in frontend-only mode');
        // If navigation is added later, you can replace this with navigation.goBack()
    };

    return (
      <ScrollView>
          <View style={[styles.container, { backgroundColor: '#E6D0F7' }]}>


            {/* Account Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
                <View style={[styles.listContainer, { backgroundColor: '#FFFFFF' }]}>
                <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="mail-outline" size={25} color="#000000" style={styles.icon} />
                        <View>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>Email</Text>
                            <Text style={[styles.itemLabel, { color: colors.boldText }]}>{user?.primaryEmailAddress?.emailAddress ?? "No email available"}</Text>                       
                             </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <FontAwesome5 name="plus-square" size={25} color="#000000" style={styles.icon} />
                        <View>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>Subscription</Text>
                            <Text style={[styles.itemLabel, { color: colors.boldText }]}>Free Plan</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="arrow-up-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Upgrade to ChatGPT Plus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="refresh-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Restore purchases</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.listItem, styles.noBorder]}>
                        <Ionicons name="server-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Data Controls</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* App Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
                <View style={[styles.listContainer, { backgroundColor: '#FFFFFF' }]}>
                <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="globe-outline" size={25} color="#000000" style={styles.icon} />
                        <View>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>App Language</Text>
                            <Text style={[styles.itemLabel, { color: colors.boldText }]}>English</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.listItem, styles.noBorder]}>
                        <Ionicons name="color-palette-outline" size={25} color="#000000" style={styles.icon} />
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>Color Scheme</Text>
                            <Menu
                                visible={menuIsVisible}
                                contentStyle={{ backgroundColor: colors.sectionBg, borderRadius: 10, width: 200 }}
                                onDismiss={() => setMenuIsVisible(false)}
                                anchor={
                                    <TouchableOpacity onPress={() => setMenuIsVisible(true)}>
                                        <Text style={[styles.itemLabel, { color: colors.boldText, textTransform: 'capitalize' }]}>
                                            {colorScheme}
                                        </Text>
                                    </TouchableOpacity>
                                }
                            >
                                <Menu.Item 
                                    onPress={() => setMenuIsVisible(false)} 
                                    titleStyle={{ fontSize: 18, color: colors.boldText }} 
                                    title="System" 
                                />
                                <Divider />
                                <Menu.Item 
                                    onPress={() => setMenuIsVisible(false)} 
                                    titleStyle={{ fontSize: 18, color: colors.boldText }} 
                                    title="Dark" 
                                />
                                <Divider />
                                <Menu.Item 
                                    onPress={() => setMenuIsVisible(false)} 
                                    titleStyle={{ fontSize: 18, color: colors.boldText }} 
                                    title="Light" 
                                />
                            </Menu>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Speech Section */}
            {/* <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Speech</Text>
                <View style={[styles.listContainer, { backgroundColor: '#FFFFFF' }]}>
                <TouchableOpacity style={[styles.listItem, styles.noBorder]}>
                        <Ionicons name="globe-outline" size={25} color="#000000" style={styles.icon} />
                        <View>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>Main Language</Text>
                            <Text style={[styles.itemLabel, { color: colors.boldText }]}>Auto-Detect</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View> */}

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                <View style={[styles.listContainer, { backgroundColor: '#FFFFFF' }]}>
                    <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="help-circle-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Help Center</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Ionicons name="lock-closed-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.listItem, styles.noBorder]}>
                        <Ionicons name="phone-portrait-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>PAC AI for iOS</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Log Out Section */}
            <View style={styles.section}>
                <View style={[styles.listContainer, { backgroundColor: '#FFFFFF' }]}>
                    <TouchableOpacity style={[styles.listItem, styles.noBorder]} onPress={handleSignOut}>
                        <Ionicons name="log-out-outline" size={25} color="#000000" style={styles.icon} />
                        <Text style={[styles.itemTitle, { color: colors.text }]}>Log out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        textTransform: 'uppercase',
        padding: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3', // Light mode default
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    icon: {
        marginRight: 15,
    },
    itemTitle: {
        fontSize: 18,
    },
    itemLabel: {
        fontSize: 16,
    },
});

export default SettingsRoute;