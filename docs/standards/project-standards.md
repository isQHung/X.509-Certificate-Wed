
---

# I. NGUYÊN TẮC CỐT LÕI (PHẢI TUÂN THỦ)

1. **Single source of truth = Jira**
    
    - Mọi task phải có trên Jira
        
    - Không làm việc “miệng” qua Messenger
        
    - Không có ticket = không tồn tại công việc
        
2. **Code phải qua review**
    
    - Không ai được push thẳng vào `main`
        
    - Tất cả code phải qua Pull Request trên GitHub
        
3. **Minh bạch tiến độ**
    
    - Task phải có trạng thái rõ ràng: `To Do → In Progress → Review → Done`
        
    - Cập nhật mỗi ngày
        

---

# II. QUY TẮC GIT & GITHUB

## 1. Branching Strategy

- `main`: production (cấm commit trực tiếp)
    
- `develop`: integration branch
    
- `feature/*`: tính năng mới
    
- `bugfix/*`: sửa bug
    
- `hotfix/*`: fix gấp production
    

👉 Format:

```
feature/x509-certificate-parser
bugfix/login-timeout
```

---

## 2. Quy tắc commit

👉 Format chuẩn:

```
[type]: [short description]

Ví dụ:
feat: add X.509 certificate validation
fix: handle expired certificate error
refactor: optimize parsing logic
```

👉 Type dùng:

- `feat`
    
- `fix`
    
- `refactor`
    
- `docs`
    
- `test`
    
- `chore`
    

❌ Không chấp nhận:

- "update code"
    
- "fix bug"
    
- commit không rõ nghĩa
    

---

## 3. Pull Request (PR)

Mỗi PR phải:

- Link Jira ticket
    
- Mô tả:
    
    - Làm gì
        
    - Cách test
        
- Có ít nhất **1 người review**
    

👉 Không merge nếu:

- Chưa review
    
- Chưa pass test
    
- Conflict chưa resolve
    

---

# III. QUY TẮC CODE

## 1. Coding standards

- Thống nhất:
    
    - naming convention (camelCase / snake_case)
        
    - format (eslint / prettier nếu dùng JS)
        
- Không viết code “tùy hứng”
    

## 2. Nguyên tắc

- Code phải:
    
    - đọc được
        
    - test được
        
    - không duplicate
        

👉 Rule quan trọng:

> Code để người khác đọc, không phải để bạn thể hiện

---

## 3. Definition of Done (DoD)

Một task chỉ được “Done” khi:

- Code đã merge
    
- Đã test
    
- Không bug
    
- Có mô tả rõ
    

---

# IV. QUẢN LÝ TASK (JIRA)

## 1. Cấu trúc task

Mỗi task phải có:

- Title rõ ràng
    
- Description:
    
    - Input
        
    - Output
        
    - Acceptance criteria
        

👉 Ví dụ:

```
Title: Validate X.509 certificate

Acceptance:
- Reject expired cert
- Reject invalid signature
- Return error message
```

---

## 2. Estimation

- Dùng story point hoặc giờ
    
- Task > 2 ngày → phải chia nhỏ
    

---

## 3. Deadline

- Mỗi task phải có deadline
    
- Trễ deadline → phải báo trước (không phải sau)
    

---

# V. GIAO TIẾP

## 1. Messenger (trao đổi nhanh)

Dùng Messenger cho:

- Hỏi nhanh
    
- Báo blocker
    

❌ Không dùng để:

- Giao task
    
- Quyết định quan trọng
    

---

## 2. Jira (chính thức)

- Tất cả:
    
    - task
        
    - bug
        
    - decision  
        → phải ghi lại trên Jira
        

---

## 3. Nguyên tắc phản hồi

- Tin nhắn: phản hồi trong ≤ 2 giờ (giờ làm việc)
    
- Blocker: báo ngay
    

---

# VI. HỌP

Dùng Google Meet

## 1. Daily standup (15 phút)

Mỗi người trả lời:

- Hôm qua làm gì
    
- Hôm nay làm gì
    
- Có bị block không
    

---

## 2. Weekly planning

- Chọn task tuần
    
- Estimate
    
- Assign
    

---

## 3. Retrospective (cuối tuần)

- Cái gì tốt
    
- Cái gì cần cải thiện
    

---

# VII. QUẢN LÝ TIẾN ĐỘ

## 1. Rule cứng

- Không update Jira = chưa làm
    
- Không PR = chưa xong
    

---

## 2. Blocker

Nếu bị kẹt > 4 tiếng:

→ phải báo ngay  
→ không tự “ôm”

---

## 3. Ownership

- 1 task = 1 owner rõ ràng
    
- Không “làm chung chung”
    

---

# VIII. KỶ LUẬT NHÓM

## 1. Không chấp nhận

- Không update tiến độ
    
- Merge code lỗi
    
- Im lặng khi bị block
    

---

## 2. Bắt buộc

- Chủ động
    
- Minh bạch
    
- Tôn trọng deadline
    
---

# KẾT LUẬN

Nếu bạn chỉ nhớ 5 điều:

1. Jira là trung tâm
    
2. Không commit thẳng main
    
3. PR bắt buộc review
    
4. Task phải rõ ràng + deadline
    
5. Bị kẹt là báo ngay
    
---