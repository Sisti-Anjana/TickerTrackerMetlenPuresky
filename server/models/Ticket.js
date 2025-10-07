const { supabase } = require('../../config/supabase');

class Ticket {
  constructor(data) {
    this.id = data.id;
    this._id = data.id;
    this.ticket_number = data.ticket_number;
    this.ticketNumber = data.ticket_number;
    this.user_id = data.user_id;
    this.customer_name = data.customer_name;
    this.customer_type = data.customer_type;
    this.asset_name = data.asset_name;
    this.site_name = data.site_name;
    this.equipment = data.equipment;
    this.category = data.category;
    this.category_id = data.category_id;
    this.site_outage = data.site_outage;
    this.ticket_status = data.ticket_status;
    this.status_id = data.status_id;
    this.issue_start_time = data.issue_start_time;
    this.issue_end_time = data.issue_end_time;
    this.total_duration = data.total_duration;
    this.kw_down = data.kw_down;
    this.case_number = data.case_number;
    this.issue_description = data.issue_description;
    this.additional_notes = data.additional_notes;
    this.priority = data.priority;
    this.created_at = data.created_at;
    this.createdAt = data.created_at;
    this.updated_at = data.updated_at;
    
    // For backward compatibility
    this.title = data.issue_description;
    this.description = data.issue_description;
    this.company = data.customer_name;
    this.status = data.ticket_status;
    
    // Add user info if available
    if (data.users) {
      this.createdBy = {
        name: data.users.name,
        email: data.users.email
      };
      this.users = data.users;
    }
  }

  // Enhanced field mapping to handle both camelCase and snake_case
  static mapFields(inputData) {
    console.log('Input data for mapping:', inputData);
    
    const mappedData = {
      user_id: inputData.user_id,
      customer_name: inputData.customer_name || inputData.customerName || inputData.company || 'Unknown Customer',
      customer_type: inputData.customer_type || inputData.customerType || 'Puresky',
      asset_name: inputData.asset_name || inputData.assetName || 'Asset 1',
      site_name: inputData.site_name || inputData.siteName || inputData.site || 'Unknown Site',
      equipment: inputData.equipment,
      category: inputData.category,
      category_id: this.getCategoryId(inputData.category),
      site_outage: inputData.site_outage || inputData.siteOutage || inputData.outage || 'No',
      ticket_status: inputData.ticket_status || inputData.ticketStatus || 'Open',
      status_id: this.getStatusId(inputData.ticket_status || inputData.ticketStatus || 'Open'),
      issue_start_time: inputData.issue_start_time || inputData.issueStartTime || inputData.issue_start,
      issue_end_time: inputData.issue_end_time || inputData.issueEndTime || inputData.issue_end,
      kw_down: inputData.kw_down || inputData.kwDown || null,
      case_number: inputData.case_number || inputData.caseNumber || null,
      issue_description: inputData.issue_description || inputData.issueDescription || inputData.description || inputData.title || 'No description provided',
      additional_notes: inputData.additional_notes || inputData.additionalNotes || null,
      priority: inputData.priority || 'Medium'
    };

    // Clean up any undefined values
    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === undefined) {
        mappedData[key] = null;
      }
    });

    console.log('Mapped data:', mappedData);
    return mappedData;
  }

  // Create a new ticket with enhanced error handling
  static async create(ticketData) {
    try {
      console.log('=== TICKET CREATION START ===');
      console.log('Original ticket data:', JSON.stringify(ticketData, null, 2));

      // Map and validate the data
      const mappedData = this.mapFields(ticketData);
      
      // Validate required fields
      const requiredFields = ['user_id', 'equipment', 'category', 'issue_description'];
      const missingFields = requiredFields.filter(field => !mappedData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Final insert data:', JSON.stringify(mappedData, null, 2));

      // Insert into database
      const { data, error } = await supabase
        .from('tickets')
        .insert([mappedData])
        .select(`
          *,
          users:user_id(name, email)
        `)
        .single();

      if (error) {
        console.error('=== DATABASE INSERT ERROR ===');
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error hint:', error.hint);
        console.error('Error details object:', error.details);
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      if (!data) {
        console.error('=== NO DATA RETURNED ===');
        throw new Error('No data returned from database insert');
      }

      console.log('=== TICKET CREATION SUCCESS ===');
      console.log('Created ticket data:', JSON.stringify(data, null, 2));
      
      return new Ticket(data);
    } catch (error) {
      console.error('=== TICKET CREATION FAILED ===');
      console.error('Error in Ticket.create:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Helper functions
  static getCategoryId(categoryName) {
    const categoryMap = {
      'Production Impacting': 1,
      'Communication Issues': 2,
      'Cannot Confirm Production': 3
    };
    return categoryMap[categoryName] || 1;
  }

  static getStatusId(statusName) {
    const statusMap = {
      'Open': 1,
      'Closed': 2,
      'Pending': 3
    };
    return statusMap[statusName] || 1;
  }

  // Find all tickets with enhanced error handling
  static async findAll(options = {}) {
    try {
      console.log('=== FETCHING TICKETS ===');
      console.log('Options:', JSON.stringify(options, null, 2));

      const { page = 1, limit = 50, search, status, category, user_id } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('tickets')
        .select(`
          *,
          users:user_id(name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('ticket_status', status);
        console.log('Applied status filter:', status);
      }
      if (category) {
        query = query.eq('category', category);
        console.log('Applied category filter:', category);
      }
      if (user_id) {
        query = query.eq('user_id', user_id);
        console.log('Applied user_id filter:', user_id);
      }
      
      // Apply search
      if (search) {
        query = query.or(
          `ticket_number.ilike.%${search}%,` +
          `customer_name.ilike.%${search}%,` +
          `equipment.ilike.%${search}%,` +
          `category.ilike.%${search}%,` +
          `issue_description.ilike.%${search}%,` +
          `case_number.ilike.%${search}%`
        );
        console.log('Applied search filter:', search);
      }

      // Apply pagination
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
        console.log('Applied pagination:', { offset, limit });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('=== ERROR FETCHING TICKETS ===');
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Database error fetching tickets: ${error.message}`);
      }
      
      console.log(`=== TICKETS FETCHED SUCCESSFULLY ===`);
      console.log(`Found ${count} total tickets, returning ${data?.length || 0} tickets`);

      return {
        tickets: data ? data.map(ticket => new Ticket(ticket)) : [],
        total: count || 0,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil((count || 0) / limit) : 1
      };
    } catch (error) {
      console.error('=== FETCH TICKETS FAILED ===');
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Find ticket by ID
  static async findById(id) {
    try {
      console.log('=== FINDING TICKET BY ID ===');
      console.log('Ticket ID:', id);

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          users:user_id(name, email)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error finding ticket:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.log('No ticket found with ID:', id);
        return null;
      }

      console.log('Ticket found successfully');
      return new Ticket(data);
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Get ticket statistics
  static async getStats() {
    try {
      console.log('=== GETTING TICKET STATS ===');

      const { data, error } = await supabase
        .from('tickets')
        .select('ticket_status, priority, category, created_at');

      if (error) {
        console.error('Error getting stats:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      const stats = {
        total: data.length,
        open: data.filter(t => t.ticket_status === 'Open').length,
        closed: data.filter(t => t.ticket_status === 'Closed').length,
        pending: data.filter(t => t.ticket_status === 'Pending').length,
        high: data.filter(t => t.priority === 'High').length,
        production_impacting: data.filter(t => t.category === 'Production Impacting').length,
        today: data.filter(t => {
          const today = new Date().toISOString().split('T')[0];
          const ticketDate = t.created_at.split('T')[0];
          return ticketDate === today;
        }).length
      };

      console.log('Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('=== GET STATS FAILED ===');
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  // Search tickets
  static async search(searchTerm, limit = 50) {
    try {
      console.log('=== SEARCHING TICKETS ===');
      console.log('Search term:', searchTerm, 'Limit:', limit);

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          users:user_id(name, email)
        `)
        .or(
          `ticket_number.ilike.%${searchTerm}%,` +
          `customer_name.ilike.%${searchTerm}%,` +
          `equipment.ilike.%${searchTerm}%,` +
          `category.ilike.%${searchTerm}%,` +
          `issue_description.ilike.%${searchTerm}%,` +
          `case_number.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching tickets:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} tickets matching search`);
      return data ? data.map(ticket => new Ticket(ticket)) : [];
    } catch (error) {
      console.error('=== SEARCH TICKETS FAILED ===');
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Ticket;