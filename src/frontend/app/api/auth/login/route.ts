import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createServerClient } from "@supabase/ssr";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body; //

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ email và mật khẩu" },
        { status: 400 },
      );
    }

    //  Tạo Supabase client (server)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined;
          },
          set() {},
          remove() {},
        },
      },
    );

    //  Login bằng Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác" },
        { status: 401 },
      );
    }

    //  Lấy info user
    const user = data.user;
    //  Lấy role từ DB
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select(
        `
    roles (
      id,
      name
    )
  `,
      )
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Role fetch error:", roleError);
    }

    const role = (roleData?.roles as any)?.name || "customer";

    const userPayload = {
      userId: user.id,
      email: user.email,
      role: role,
      status: "ACTIVE",
    };

    //  Tạo JWT riêng
    const token = await new SignJWT(userPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(SECRET_KEY);

    //  Set cookie bằng NextResponse
    const response = NextResponse.json(
      {
        message: "Đăng nhập thành công",
        userPayload: userPayload,
      },
      { status: 200 },
    );

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // dev dễ hơn
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi đăng nhập" },
      { status: 500 },
    );
  }
}
