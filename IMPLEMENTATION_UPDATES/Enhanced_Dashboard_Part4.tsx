  // Utility functions for styling
  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return 'status-badge open';
    const statusClass = status.toLowerCase().replace(' ', '-');
    return `status-badge ${statusClass}`;
  };

  const getCategoryBadge = (category: string | undefined | null) => {
    if (!category) return 'category-badge default';
    if (category === 'Production Impacting') return 'category-badge production';
    if (category === 'Communication Issues') return 'category-badge communication';
    if (category === 'Cannot Confirm Production') return 'category-badge confirm';
    return 'category-badge default';
  };

  const getOutageBadge = (outage: string | undefined | null) => {
    if (!outage) return 'outage-badge no';
    const outageClass = outage.toLowerCase().replace(/\s+/g, '').replace('(', '').replace(')', '');
    return `outage-badge ${outageClass}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime?: string, endTime?: string, totalDuration?: string) => {
    if (totalDuration) return totalDuration;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
          <small>Please wait while we fetch your tickets</small>
        </div>
      </div>
    );
  }
