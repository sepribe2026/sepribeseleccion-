import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cedula, password } = body;

        if (!cedula || !password) {
            return NextResponse.json(
                { success: false, error: 'Cédula y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // 1. Validar contra el Web Service externo
        const response = await fetch('https://ns.aseyco.com:444/MSWebServiceNomina/rest/service/wsNominaEmp', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ cedula, password })
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Credenciales inválidas en el sistema de nómina' },
                { status: 401 }
            );
        }

        const data = await response.json();

        if (data.error || data.success === false) {
            return NextResponse.json(
                { success: false, error: data.message || 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // 2. Validar que la cédula esté autorizada en admin_profiles
        const { data: profile, error: profileError } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('cedula', cedula)
            .eq('is_active', true)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { success: false, error: 'Usuario no autorizado para acceder al panel administrativo' },
                { status: 403 }
            );
        }

        // 3. Retornar éxito con los datos del perfil
        return NextResponse.json({
            success: true,
            user: {
                cedula: profile.cedula,
                name: profile.name
            }
        });

    } catch (error) {
        console.error('Error in authentication:', error);
        return NextResponse.json(
            { success: false, error: 'Error de conexión con el servidor' },
            { status: 500 }
        );
    }
}
