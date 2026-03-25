import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = await cookies(); 
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                    }
                },
            },
        }
    );
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: userRoleData } = await supabase
            .from("user_roles")
            .select(`roles!role_id ( name )`)
            .eq("user_id", user.id)
            .maybeSingle();

        const roleName = (userRoleData?.roles as any)?.name;

        if (roleName?.toUpperCase() !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ message: "Welcome Admin" }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//     const authHeader = request.headers.get("Authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//         return NextResponse.json({ error: "Unauthorized - No Token" }, { status: 401 });
//     }

//     const idToken = authHeader.split("Bearer ")[1];
//     const supabase = createClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.SUPABASE_SERVICE_ROLE_KEY!,
//         {
//             cookies: {
//                 getAll: () => cookieStore.getAll(),
//             },
//         }
//     );

//     try {
//         const { data: { user }, error: authError } = await supabase.auth.getUser(idToken);

//         if (authError || !user) {
//             return NextResponse.json({ error: "Invalid or Expired Token" }, { status: 401 });
//         }

//         const { data: userRoleData, error: dbError } = await supabase
//             .from("user_roles")
//             .select(`
//                 roles!role_id (
//                     name
//                 )
//             `)
//             .eq("user_id", user.id)
//             .maybeSingle();

//         if (dbError || !userRoleData) {
//             return NextResponse.json({ error: "Forbidden - No Role Assigned" }, { status: 403 });
//         }

//         const roleName = (userRoleData.roles as any)?.name;

//         if (roleName?.toUpperCase() !== "ADMIN") {
//             return NextResponse.json({ error: "Forbidden - Admin Access Required" }, { status: 403 });
//         }

//         return NextResponse.json({ 
//             message: "Welcome Admin", 
//             user: { email: user.email, id: user.id } 
//         }, { status: 200 });

//     } catch (err: any) {
//         console.error("Internal Server Error:", err.message);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }