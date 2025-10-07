  return (
    <div className="page">
      {/* Enhanced Dashboard Header */}
      <div className="dashboard-header">
        <div className="page-header">
          <h1 className="page-title">
            {filter === 'my-tickets' ? 'My Tickets' : 'All Tickets'} Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}! 
            {filter === 'my-tickets' ? ' Here are your tickets.' : ' Here are all system tickets.'}
          </p>
          <div className="dashboard-meta">
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
            {refreshing && <span className="refreshing-indicator">🔄 Refreshing...</span>}
          </div>
        </div>
        
        <div className="dashboard-actions">
          <div className="filter-buttons">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              📊 All Tickets
            </button>
            <button 
              onClick={() => handleFilterChange('my-tickets')}
              className={`btn ${filter === 'my-tickets' ? 'btn-primary' : 'btn-outline'}`}
            >
              👤 My Tickets
            </button>
          </div>
          <button 
            onClick={handleRefresh} 
            className="btn btn-outline"
            disabled={refreshing}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <Link to="/create-ticket" className="btn btn-primary">
            ➕ Create New Ticket
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>⚠️ Error:</strong> {error}
            <button onClick={handleRefresh} className="btn btn-small btn-outline">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      <div className="search-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${filter === 'my-tickets' ? 'your' : 'all'} tickets by number, customer, equipment, creator...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>
            ✕ Clear
          </button>
        )}
        <div className="search-results-count">
          {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>
