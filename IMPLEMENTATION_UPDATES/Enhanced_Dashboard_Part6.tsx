      {/* Enhanced Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">
              {filter === 'my-tickets' ? 'Your Total' : 'Total Tickets'}
            </div>
          </div>
        </div>
        <div className="stat-card open">
          <div className="stat-icon">🔵</div>
          <div className="stat-content">
            <div className="stat-number">{stats.open}</div>
            <div className="stat-label">Open</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card closed">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{stats.closed}</div>
            <div className="stat-label">Closed</div>
          </div>
        </div>
        <div className="stat-card production">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.production_impacting}</div>
            <div className="stat-label">Production Impact</div>
          </div>
        </div>
        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card week">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.this_week}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        <div className="stat-card month">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.this_month}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tickets List */}
      <div className="tickets-section">
        <div className="section-header">
          <h2 className="section-title">
            {searchTerm ? `Search Results (${filteredTickets.length})` : 
             filter === 'my-tickets' ? 'Your Recent Tickets' : 'Recent Tickets'}
          </h2>
          {!searchTerm && (
            <div className="section-meta">
              Showing {filteredTickets.length} {filter === 'my-tickets' ? 'of your tickets' : 'tickets'}
            </div>
          )}
        </div>
