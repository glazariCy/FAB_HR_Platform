import { useState } from 'react'
import './CertificateRequestForm.css'

const initialValues = {
  address_to: '', purpose: '',
  issued_on: '', employee_id: '',
}

function CertificateRequestForm() {
  const [values, setValues] = useState(initialValues)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault() //stops reload
    console.log('Submitting:', values)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="address_to">Address to</label>
        <textarea
          id="address_to"
          name="address_to"
          rows={3}
          value={values.address_to}
          onChange={handleChange}
        />
      </div>
     <div className="form-field">
        <label htmlFor="purpose">Purpose</label>
        <textarea
          id="purpose"
          name="purpose"
          rows={5}
          value={values.purpose}
          onChange={handleChange}
        />
      </div>
      <div className="form-field">
        <label htmlFor="issued_on">Issued on</label>
        <input type="date"
          id="issued_on"
          name="issued_on"          
          value={values.issued_on}
          onChange={handleChange}
        />
      </div>
      <div className="form-field">
        <label htmlFor="employee_id">Employee Id</label>
        <input type="text"
          id="employee_id"
          name="employee_id"          
          value={values.employee_id}
          onChange={handleChange}
        />
      </div>      

      <button type="submit" className="btn-primary">Submit</button>
    </form>
  )
}

export default CertificateRequestForm