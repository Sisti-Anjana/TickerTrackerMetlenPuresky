// Status badge utility functions

export const getStatusBadge = (status: string | undefined) => {
  if (!status) return 'badge-secondary';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('open')) {
    return 'badge-warning';
  }
  
  if (statusLower.includes('resolved') || statusLower.includes('closed')) {
    return 'badge-success';
  }
  
  if (statusLower.includes('pending') || statusLower.includes('in progress')) {
    return 'badge-info';
  }
  
  return 'badge-secondary';
};

export const getStatusIcon = (status: string | undefined) => {
  if (!status) return '📋';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('open')) {
    return '🔄';
  }
  
  if (statusLower.includes('resolved') || statusLower.includes('closed')) {
    return '✓';
  }
  
  if (statusLower.includes('pending') || statusLower.includes('in progress')) {
    return '⏳';
  }
  
  return '📋';
};

export const getPriorityBadge = (priority: string | undefined) => {
  if (!priority) return 'badge-secondary';
  
  const priorityLower = priority.toLowerCase();
  
  if (priorityLower.includes('high') || priorityLower.includes('critical')) {
    return 'badge-danger';
  }
  
  if (priorityLower.includes('medium')) {
    return 'badge-warning';
  }
  
  return 'badge-success';
};

export const getPriorityIcon = (priority: string | undefined) => {
  if (!priority) return '⬇️';
  
  const priorityLower = priority.toLowerCase();
  
  if (priorityLower.includes('high') || priorityLower.includes('critical')) {
    return '↑';
  }
  
  if (priorityLower.includes('medium')) {
    return '→';
  }
  
  return '↓';
};

export const getCategoryBadge = (category: string | undefined) => {
  if (!category) return 'badge-secondary';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('production')) {
    return 'badge-danger';
  }
  
  if (categoryLower.includes('communication')) {
    return 'badge-info';
  }
  
  if (categoryLower.includes('cannot confirm')) {
    return 'badge-secondary';
  }
  
  return 'badge-secondary';
};

export const getCategoryIcon = (category: string | undefined) => {
  if (!category) return '📋';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('production')) {
    return '⚡';
  }
  
  if (categoryLower.includes('communication')) {
    return '📡';
  }
  
  if (categoryLower.includes('cannot confirm')) {
    return '❓';
  }
  
  return '📋';
};

export const getOutageBadge = (outageStatus: string | undefined) => {
  if (!outageStatus) return 'badge-secondary';
  
  const statusLower = outageStatus.toLowerCase();
  
  if (statusLower === 'yes' || statusLower === 'true') {
    return 'badge-danger';
  }
  
  return 'badge-success';
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hoursStr}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};
