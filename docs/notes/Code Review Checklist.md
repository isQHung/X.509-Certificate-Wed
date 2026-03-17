ODE REVIEW CHECKLIST (CỰC KỲ QUAN TRỌNG)

Reviewer phải check hết:

1. Logic

- Có đúng requirement (Jira) không?

- Có miss edge case không?

2. Code quality

- Dễ đọc không?

- Có duplicate không?

- Naming rõ không?

3. Security (QUAN TRỌNG với X.509)

- Validate input chưa?

- Có risk injection không?

- Check:

    - expired cert

    - invalid signature

4. Performance

- Có loop thừa không?

- Có xử lý nặng không cần thiết không?

5. Test

- Test case đủ chưa?

- Có case fail không?

6. Logging

- Có log khi error không?

- Log có hữu ích không?

7. Git hygiene

- Commit message đúng format chưa?

- PR có sạch không (không lẫn code rác)?