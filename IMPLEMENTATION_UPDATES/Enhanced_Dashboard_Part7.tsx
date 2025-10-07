        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <div className="empty-icon">🔍</div>
                <h3>No tickets found</h3>
                <p>No tickets match your search "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="btn btn-outline">
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">📋</div>
                <h3>{filter === 'my-tickets' ? 'No tickets yet' : 'No tickets in system'}</h3>
                <p>
                  {filter === 'my-tickets' 
                    ? "You haven't created any tickets yet." 
                    : 'No tickets have been created in the system yet.'}
                </p>
                <Link to="/create-ticket" className="btn btn-primary">
                  Create Your First Ticket
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-number">
                    <Link to={`/tickets/${ticket.id}`} className="ticket-link">
                      {ticket.ticket_number || 'No Number'}
                    </Link>
                  </div>
                  <div className="ticket-badges">
                    <span className={getStatusBadge(ticket.ticket_status)}>
                      {ticket.ticket_status || 'Open'}
                    </span>
                    {ticket.is_owner && (
                      <span className="owner-badge">👤 Your ticket</span>
                    )}
                  </div>
                </div>

                <div className="ticket-content">
                  <div className="ticket-field">
                    <span className="field-label">Customer:</span>
                    <span className="field-value">{ticket.customer_name || 'N/A'}</span>
                  </div>

                  <div className="ticket-field">
                    <span className="field-label">Equipment:</span>
                    <span className="field-value">{ticket.equipment || 'N/A'}</span>
                  </div>

                  <div className="ticket-field">
                    <span className="field-label">Site:</span>
                    <span className="field-value">{ticket.site_name || 'N/A'}</span>
                  </div>

                  <div className="ticket-field">
                    <span className="field-label">Category:</span>
                    <span className={getCategoryBadge(ticket.category)}>
                      {ticket.category || 'Unknown'}
                    </span>
                  </div>

                  {ticket.site_outage && ticket.site_outage !== 'No' && (
                    <div className="ticket-field">
                      <span className="field-label">Site Outage:</span>
                      <span className={getOutageBadge(ticket.site_outage)}>
                        {ticket.site_outage}
                      </span>
                    </div>
                  )}

                  {ticket.kw_down && (
                    <div className="ticket-field">
                      <span className="field-label">kW Down:</span>
                      <span className="field-value power-down">
                        {ticket.kw_down} kW
                      </span>
                    </div>
                  )}
