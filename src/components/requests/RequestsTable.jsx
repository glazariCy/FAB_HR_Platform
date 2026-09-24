import { formatApiDate } from '../../utils/requests'
import AutoGrowInput from './AutoGrowInput'
import './RequestsTable.css'

// Only Issued on and Status can be sorted (F04-R02)
const COLUMNS = [
  { key: 'reference_no', label: 'Reference No.', className: 'col-reference' },
  { key: 'address_to', label: 'Address to', className: 'col-address' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'issued_on', label: 'Issued on', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

// Search icon
function SearchIcon() {
  return (
    <svg className="filter-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="10.8" y1="10.8" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// × button that empties one filter. shown only when the input has a value
function ClearFilterButton({ label, onClick }) {
  return (
    <button type="button" className="filter-clear" onClick={onClick} aria-label={`Clear ${label} filter`}>
      <span aria-hidden="true">×</span>
    </button>
  )
}

// 'Under Review' -> 'under-review', used for the badge colour
function toClassName(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

function RequestsTable({
  requests,
  sort,
  onSortChange,
  filters,
  onFilterChange,
  statusOptions,
  onClearFilters,
  onClearFilter,
}) {
  function renderHeader(column) {
    if (!column.sortable) {
      return <th key={column.key} scope="col" className={column.className}>{column.label}</th>
    }

    const isActive = sort.key === column.key
    const arrow = !isActive ? '↕' : sort.direction === 'asc' ? '▲' : '▼'
    // aria-sort tells screen readers which column is sorted and in which direction
    const ariaSort = !isActive ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending'

    return (
      <th key={column.key} scope="col" aria-sort={ariaSort}>
        <button
          type="button"
          className={`sort-button ${isActive ? 'sort-button--active' : ''}`}
          onClick={() => onSortChange(column.key)}
        >
          {column.label}
          <span className="sort-arrow" aria-hidden="true">{arrow}</span>
        </button>
      </th>
    )
  }

  return (
    // The wrapper scrolls sideways on small screens instead of squashing the table
    <div className="table-wrapper">
      <table className="requests-table">
        <thead>
          <tr>{COLUMNS.map(renderHeader)}</tr>

          {}
          <tr className="filter-row">
            <td>
              <div className="filter-input">
                <SearchIcon />
                <AutoGrowInput
                  inputMode="numeric"
                  name="reference_no"
                  maxLength={20}
                  value={filters.reference_no}
                  onChange={onFilterChange}
                  aria-label="Filter by Reference No. (exact match)"
                />
                {filters.reference_no !== '' && (
                  <ClearFilterButton label="Reference No." onClick={() => onClearFilter('reference_no')} />
                )}
              </div>
            </td>
            <td>
              <div className="filter-input">
                <SearchIcon />
                <AutoGrowInput
                  name="address_to"
                  maxLength={150}
                  value={filters.address_to}
                  onChange={onFilterChange}
                  aria-label="Filter by Address to (contains words)"
                />
                {filters.address_to !== '' && (
                  <ClearFilterButton label="Address to" onClick={() => onClearFilter('address_to')} />
                )}
              </div>
            </td>
            <td aria-hidden="true" />
            <td aria-hidden="true" />
            <td>
              <div className="filter-input filter-input--select">
                <select
                  name="status"
                  value={filters.status}
                  onChange={onFilterChange}
                  aria-label="Filter by Status"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {filters.status !== '' && (
                  <ClearFilterButton label="Status" onClick={() => onClearFilter('status')} />
                )}
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="no-results">
                No requests match your filters.{' '}
                <button type="button" className="btn-link" onClick={onClearFilters}>
                  Clear filters
                </button>
              </td>
            </tr>
          )}
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.reference_no}</td>
              <td className="col-address">{request.address_to}</td>
              <td>{request.purpose}</td>
              <td className="nowrap">{formatApiDate(request.issued_on)}</td>
              <td>
                <span className={`status-badge status-badge--${toClassName(request.status)}`}>
                  {request.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RequestsTable
