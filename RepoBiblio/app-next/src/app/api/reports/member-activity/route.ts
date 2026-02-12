import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/bd';
import { z } from 'zod';

const memberActivitySchema = z.object({
  q: z.string().max(100).optional().default(""),
  minLoans: z.coerce.number().int().min(0).optional().default(0),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

interface ActividadSocio {
  member_id: number;
  member_name: string;
  total_loans: number;  
  returned_loans: number;
  late_returns: number;
  late_return_rate: number;
}

interface KPIs {
  totalSocios: number;
  socioMasActivo: ActividadSocio | null;
  promedioTasaMorosidad: number;
  sociosConMorosidad: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SuccessResponse {
  success: true;
  data: ActividadSocio[];
  kpis: KPIs;
  pagination: Pagination;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

type ApiResponse = SuccessResponse | ErrorResponse;

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      q: searchParams.get('q') || '',
      minLoans: searchParams.get('minLoans') || '0',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    };

    const validated = memberActivitySchema.safeParse(params);
    
    if (!validated.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Parámetros inválidos', 
          details: validated.error
        },
        { status: 400 }
      );
    }

    const { q: busqueda, minLoans, page, limit } = validated.data;
    const offset = (page - 1) * limit;

    // Query principal
    const sql = `
      SELECT * FROM vw_member_activity 
      WHERE member_name ILIKE $1 
        AND total_loans >= $2
      ORDER BY total_loans DESC, late_return_rate DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(sql, [`%${busqueda}%`, minLoans, limit, offset]);

    // Contar total
    const countSql = `
      SELECT COUNT(*) as total 
      FROM vw_member_activity 
      WHERE member_name ILIKE $1 
        AND total_loans >= $2
    `;
    const countResult = await query(countSql, [`%${busqueda}%`, minLoans]);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Calcular KPIs
    const socios: ActividadSocio[] = result.rows;
    const sociosConMorosidad = socios.filter(s => parseFloat(String(s.late_return_rate)) > 0).length;
    const sumaRates = socios.reduce((acc, s) => acc + parseFloat(String(s.late_return_rate)), 0);

    const kpis: KPIs = {
      totalSocios: total,
      socioMasActivo: socios.sort((a, b) => 
        parseInt(String(b.total_loans)) - parseInt(String(a.total_loans))
      )[0] || null,
      promedioTasaMorosidad: socios.length > 0 ? sumaRates / socios.length : 0,
      sociosConMorosidad
    };

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: result.rows,
      kpis,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error en API member-activity:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}