const { supabase } = require('../../config/supabase');

class Comment {
  constructor(data) {
    this.id = data.id;
    this.content = data.content;
    this.ticket_id = data.ticket_id;
    this.author_id = data.author_id;
    this.created_at = data.created_at;
  }

  // Create a new comment
  static async create(commentData) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: commentData.content,
            ticket_id: commentData.ticket_id,
            author_id: commentData.author_id
          }
        ])
        .select(`
          *,
          users:author_id(name, email)
        `)
        .single();

      if (error) throw error;
      return new Comment(data);
    } catch (error) {
      throw error;
    }
  }

  // Find comment by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:author_id(name, email)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? new Comment(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all comments for a ticket
  static async findByTicketId(ticketId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:author_id(name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data.map(comment => new Comment(comment));
    } catch (error) {
      throw error;
    }
  }

  // Update comment
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update(updateData)
        .eq('id', this.id)
        .select(`
          *,
          users:author_id(name, email)
        `)
        .single();

      if (error) throw error;
      
      // Update current instance
      Object.assign(this, data);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete comment
  async delete() {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get all comments with pagination
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, ticket_id, author_id } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('comments')
        .select(`
          *,
          users:author_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (ticket_id) query = query.eq('ticket_id', ticket_id);
      if (author_id) query = query.eq('author_id', author_id);

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        comments: data.map(comment => new Comment(comment)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Comment;