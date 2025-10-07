                  <div className="ticket-field">
                    <span className="field-label">Duration:</span>
                    <span className="field-value">
                      {formatDuration(ticket.issue_start_time, ticket.issue_end_time, ticket.total_duration)}
                    </span>
                  </div>

                  {ticket.issue_description && (
                    <div className="ticket-field">
                      <span className="field-label">Description:</span>
                      <p className="field-description">
                        {ticket.issue_description.length > 100 
                          ? `${ticket.issue_description.substring(0, 100)}...` 
                          : ticket.issue_description}
                      </p>
                    </div>
                  )}

                  {ticket.case_number && (
                    <div className="ticket-field">
                      <span className="field-label">Case Number:</span>
                      <span className="field-value case-number">
                        {ticket.case_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="ticket-footer">
                  <div className="ticket-meta">
                    <div className="created-info">
                      <span className="created-by">
                        Created by: {ticket.users?.name || ticket.created_by_name || 'Unknown'}
                      </span>
                      <span className="created-date">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <Link 
                      to={`/tickets/${ticket.id}`} 
                      className="btn btn-small btn-outline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Dashboard Info */}
      <div className="dashboard-footer">
        <div className="dashboard-info">
          <p>
            Dashboard last refreshed at {lastUpdate.toLocaleTimeString()} • 
            Showing {filter === 'my-tickets' ? 'your tickets only' : 'all system tickets'} • 
            Auto-refresh every 30 seconds
          </p>
          {stats.last_updated && (
            <small>
              Server data last updated: {new Date(stats.last_updated).toLocaleTimeString()}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
