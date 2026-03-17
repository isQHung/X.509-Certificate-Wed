# Chạy chương trình

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Mở localhost:3000

## Lưu ý
Hiện tại chưa liên kết db nên nhập đúng mới đăng nhập được, còn đăng ký thì mặc định là luồng user (thông tin đăng ký sẽ không được lưu lại)

2 luồng: admin, user
admin:
    username: admin
    password: 123
user:
    username: user
    password: 123