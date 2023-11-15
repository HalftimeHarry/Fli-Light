

import { supabase } from '../../supabaseClient';

// In your getCurrentUser function
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log("User in getCurrentUser:", user); // Log the user here

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}
