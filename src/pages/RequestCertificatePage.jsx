import CertificateRequestForm from '../components/certificates/CertificateRequestForm'

function RequestCertificate() {
  return (
    <>
      {/* React 19 moves <title> into the document <head> automatically: sets the browser tab title */}
      <title>Request Certificate · FAB HR</title>
      <h1>Request a Certificate</h1>
      <CertificateRequestForm />
    </>
  )
}

export default RequestCertificate
