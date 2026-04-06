import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body; //
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;
    const user = authData?.user;

    if (user) {
      const { error: userError } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          password_hash: "",
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);

      if (userError) {
        console.error("Lỗi insert bảng users:", userError);
        throw new Error(
          "Không thể tạo thông tin người dùng trong cơ sở dữ liệu.",
        );
      }

      const { data: role, error: roleFetchError } = await supabase
        .from("roles")
        .select("id")
        .ilike("name", "customer")
        .single();

      if (roleFetchError || !role) {
        console.error("Lỗi lấy Role:", roleFetchError);
        throw new Error("Không tìm thấy vai trò người dùng mặc định.");
      }

      const { error: userRoleError } = await supabase
        .from("user_roles")
        .insert([{ user_id: user.id, role_id: role.id }]);

      if (userRoleError) {
        console.error("Lỗi insert bảng user_roles:", userRoleError);
        throw new Error("Không thể cấp quyền cho người dùng.");
      }

      const response = NextResponse.json({ success: true });

      response.cookies.set("userRole", "customer", {
        httpOnly: true,
        secure: true, 
        sameSite: "lax",
        path: "/",
      });

      return response;
    } else {
         return NextResponse.json(
           { message: "Không tạo được user" },
           { status: 400 },
         );
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi đăng nhập" },
      { status: 500 },
    );
  }
}