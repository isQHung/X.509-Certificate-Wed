import { adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Lấy Token từ Header (Theo chuẩn JWT)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // 2. Xác thực Token bằng Admin SDK (Đáp ứng AC #2)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // 3. Kiểm tra Role trong Custom Claims hoặc Firestore
    const { adminDb } = await import("@/lib/firebase-admin");
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "ADMIN") {
      // Case 3: Customer truy cập API Admin -> 403 Forbidden
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Case 4: Admin truy cập -> 200 OK
    return NextResponse.json({ message: "Welcome Admin", status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }
}