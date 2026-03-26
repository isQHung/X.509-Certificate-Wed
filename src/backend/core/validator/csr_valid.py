

def check_csr_valid(csr_req):
    # 1. CSR tồn tại
    if not csr_req:
        return False

    # 2. Subject
    subject = csr_req.get("subject", {})
    if not subject.get("CN"):
        return False
    if "C" in subject and len(subject["C"]) != 2:
        return False

    # 3. Public key
    public_key = csr_req.get("csr_pem", {}).encode()
    if not public_key:
        return False
   
    return True