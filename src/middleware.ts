import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cambia a false o define NEXT_PUBLIC_SERVICE_SUSPENDED="false" cuando quieras reactivar el sistema
const SERVICE_SUSPENDED = process.env.NEXT_PUBLIC_SERVICE_SUSPENDED !== "false";

export function middleware(request: NextRequest) {
  if (!SERVICE_SUSPENDED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Bloquear todas las rutas de API mientras el servicio esté suspendido
  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: "Servicio suspendido",
        message: "El acceso a la plataforma se encuentra temporalmente suspendido.",
      },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

