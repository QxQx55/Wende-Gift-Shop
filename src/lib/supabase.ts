import { createClient } from '@supabase/supabase-js';
import { Profile, UserRole, Product, Category, Review } from '../types';

// Use environment variables for production security
const supabaseUrl = 'https://mnwtsoidxujpwdgvkzpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ud3Rzb2lkeHVqcHdkZ3ZrenB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDE2MjksImV4cCI6MjA5MjA3NzYyOX0.zUeRB3yw1iTZb9GmomJZJTGMaoafZ1vZQKWG0A_jsKI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const signUpUser = async (email: string, password: string, name: string, role: UserRole) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  });
};

export const signInUser = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }

  return data as Profile;
};

export const uploadProductImage = async (file: File) => {
  // Client-side validation for better UX
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('Image size must be less than 5MB.');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        throw new Error('Storage bucket "product-images" not found. Please create it in your Supabase dashboard.');
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Product[];
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as Category[];
};

export const getReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn('Reviews table fetch error:', error.message);
    return [];
  }
  return data as Review[];
};

export const createProduct = async (productData: Partial<Product>) => {
  const { data, error } = await supabase.from('products').insert(productData).select().single();
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select().single();
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const createCategory = async (name: string) => {
  const { data, error } = await supabase.from('categories').insert({ name }).select().single();
  if (error) throw error;
  return data as Category;
};

export const subscribeToProducts = (callback: () => void) => {
  const channelId = `products-realtime-${Math.random().toString(36).substring(2, 10)}`;
  return supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
    .subscribe();
};

export const subscribeToCategories = (callback: () => void) => {
  const channelId = `categories-realtime-${Math.random().toString(36).substring(2, 10)}`;
  return supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, callback)
    .subscribe();
};