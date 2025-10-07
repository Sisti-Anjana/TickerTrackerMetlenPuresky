const { supabase } = require('../../config/supabase');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.created_at = data.created_at;
  }

  // Create a new user with enhanced logging
  static async create(userData) {
    try {
      console.log('=== USER CREATION START ===');
      console.log('Creating user with data:', { name: userData.name, email: userData.email });

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      console.log('Password hashed successfully');

      const insertData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword
      };

      const { data, error } = await supabase
        .from('users')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('=== USER CREATION ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        console.error('=== NO USER DATA RETURNED ===');
        throw new Error('No data returned from user creation');
      }

      console.log('=== USER CREATION SUCCESS ===');
      console.log('Created user:', { id: data.id, name: data.name, email: data.email });
      return new User(data);
    } catch (error) {
      console.error('=== USER CREATION FAILED ===');
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  // Find user by email with enhanced logging
  static async findByEmail(email) {
    try {
      console.log('=== FINDING USER BY EMAIL ===');
      console.log('Looking for user with email:', email);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('=== FIND USER ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('No user found with email:', email);
        return null;
      }

      console.log('=== USER FOUND ===');
      console.log('Found user:', { id: data.id, name: data.name, email: data.email });
      return new User(data);
    } catch (error) {
      console.error('=== FIND USER BY EMAIL FAILED ===');
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  // Find user by ID with enhanced logging
  static async findById(id) {
    try {
      console.log('=== FINDING USER BY ID ===');
      console.log('Looking for user with ID:', id, 'Type:', typeof id);

      // Convert to integer to handle BIGINT properly
      const userId = parseInt(id);
      console.log('Converted ID to integer:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('=== FIND USER BY ID ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('No user found with ID:', userId);
        return null;
      }

      console.log('=== USER FOUND BY ID ===');
      console.log('Found user:', { id: data.id, name: data.name, email: data.email });
      return new User(data);
    } catch (error) {
      console.error('=== FIND USER BY ID FAILED ===');
      console.error('Error in findById:', error);
      throw error;
    }
  }
  // Update user
  async update(updateData) {
    try {
      console.log('=== UPDATING USER ===');
      console.log('Updating user ID:', this.id, 'with data:', updateData);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        console.error('=== UPDATE USER ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.error('=== NO DATA RETURNED FROM UPDATE ===');
        throw new Error('No data returned from user update');
      }

      // Update current instance
      Object.assign(this, data);
      console.log('=== USER UPDATED SUCCESSFULLY ===');
      return this;
    } catch (error) {
      console.error('=== UPDATE USER FAILED ===');
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Compare password with enhanced logging
  async comparePassword(candidatePassword) {
    try {
      console.log('=== COMPARING PASSWORD ===');
      console.log('Comparing password for user:', this.email);
      
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log('Password comparison result:', isMatch ? 'MATCH' : 'NO MATCH');
      
      return isMatch;
    } catch (error) {
      console.error('=== PASSWORD COMPARISON ERROR ===');
      console.error('Error comparing password:', error);
      throw error;
    }
  }

  // Get all users
  static async findAll() {
    try {
      console.log('=== FINDING ALL USERS ===');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('=== FIND ALL USERS ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('=== FOUND ALL USERS ===');
      console.log('Found', data?.length || 0, 'users');
      return data ? data.map(user => new User(user)) : [];
    } catch (error) {
      console.error('=== FIND ALL USERS FAILED ===');
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Delete user
  async delete() {
    try {
      console.log('=== DELETING USER ===');
      console.log('Deleting user ID:', this.id);

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', this.id);

      if (error) {
        console.error('=== DELETE USER ERROR ===');
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('=== USER DELETED SUCCESSFULLY ===');
      return true;
    } catch (error) {
      console.error('=== DELETE USER FAILED ===');
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

module.exports = User;