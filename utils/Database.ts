// utils/Database.ts
import { createClient } from '@supabase/supabase-js';
import { Message, Role } from '@/utils/Interfaces';

// Supabase configuration
const supabaseUrl = 'https://gtekgvrrkdynqndporfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZWtndnJya2R5bnFuZHBvcmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTMzMTcsImV4cCI6MjA1NDY4OTMxN30.Ou9alGeLQ7Xor_JJM2cnXNpdwYnhSBBUz87fjZQH2Jg';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// No migration needed for Supabase since schema is managed server-side
export async function migrateDbIfNeeded() {
  // No-op for Supabase; schema is already defined in your SQL setup
  console.log('Supabase schema is managed server-side; no local migration needed.');
}

// Helper function to get or create a user ID based on email
export const getOrCreateUserId = async (email: string): Promise<string> => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  if (user) {
    return user.id;
  }
  console.log('User not found, creating new user...');
  console.log('this is not preferred need to do some thing abou this ');
  // Create new user if not found
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({ email })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Error creating user: ${insertError.message}`);
  }

  return newUser.id;
};

// Add a new chat
export const addChat = async (userId: string | null, title: string) => {
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Error adding chat: ${error.message}`);
  }

  return { lastInsertRowId: data.id }; // Mimic SQLite return format for compatibility
};

// Get all chats for a user
export const getChats = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Optional: sort by creation time

  if (error) {
    throw new Error(`Error fetching chats: ${error.message}`);
  }

  return data;
};

export const getSearchedChats = async (userId: string, query: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', `%${query}%`) // Case-insensitive search on title
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error searching chats: ${error.message}`);
  }
  console.log('searched chats from the getSearchedChats fucntion:', data);
  return data;
};

// Get messages for a specific chat
export const getMessages = async (chatId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true }); // Ensure messages are in chronological order

  if (error) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }

  return data.map((message) => ({
    id: message.id,
    chat_id: message.chat_id,
    content: message.content,
    role: message.role === 'bot' ? Role.Bot : Role.User,
    created_at: message.created_at,
  }));
};

// Add a message to a chat
export const addMessage = async (
  chatId: string,
  { content, role }: Message
) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      content,
      role: role === Role.Bot ? 'bot' : 'user',
    });

  if (error) {
    throw new Error(`Error adding message: ${error.message}`);
  }
};

// Delete a chat (and its messages due to CASCADE)
export const deleteChat = async (chatId: string) => {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) {
    throw new Error(`Error deleting chat: ${error.message}`);
  }
};

// Rename a chat
export const renameChat = async (chatId: string, title: string) => {
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId);

  if (error) {
    throw new Error(`Error renaming chat: ${error.message}`);
  }
};