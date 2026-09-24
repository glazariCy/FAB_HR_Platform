import { formatApiDate } from '../../utils/requests'
import './RequestsTable.css'

// Only Issued on and Status can be sorted (F04-R02)
const COLUMNS = [
  { key: 'reference_no', label: 'Reference No.' },
  { key: 'address_to', label: 'Address to' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'issued_on', label: 'Issued on', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

// 'Under Review' -> 'under-review', used for the badge colour
function toClassName(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

function RequestsTable({ requests, sort, onSortChange }) {
  function renderHeader(column) {
    if (!column.sortable) {
      return <th key={column.key} scope="col">{column.label}</th>
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
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.reference_no}</td>
              <td>{request.address_to}</td>
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
