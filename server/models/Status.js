const { supabase } = require('../../config/supabase');

class Status {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }

  // Get all statuses
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data.map(status => new Status(status));
    } catch (error) {
      throw error;
    }
  }

  // Find status by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? new Status(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Create a new status
  static async create(statusData) {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .insert([{ name: statusData.name }])
        .select()
        .single();

      if (error) throw error;
      return new Status(data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Status;
