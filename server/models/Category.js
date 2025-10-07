const { supabase } = require('../../config/supabase');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }

  // Get all categories
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data.map(category => new Category(category));
    } catch (error) {
      throw error;
    }
  }

  // Find category by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? new Category(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Create a new category
  static async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryData.name }])
        .select()
        .single();

      if (error) throw error;
      return new Category(data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category;
