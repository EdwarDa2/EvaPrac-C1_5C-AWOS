import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/bd';
import { z } from 'zod';

const finesSchema = z.object({
  startMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12)
});

interface MultaMensual {
  month_label: string;
  total_fines: number;
  total_amount_generated: number;
  total_collected: number;
  pending_debt: number;
}

interface KPIs {
  totalGenerado: number;
  totalRecaudado: number;
  totalPendiente: number;
  tasaRecaudacion: number;
  mejorMes: MultaMensual | null;
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
  data: MultaMensual[];
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
      startMonth: searchParams.get('startMonth') || undefined,
      endMonth: searchParams.get('endMonth') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12'
    };

    const validated = finesSchema.safeParse(params);
    
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

    const { startMonth, endMonth, page, limit } = validated.data;
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM vw_fines_summary WHERE 1=1`;
    const sqlParams: any[] = [];
    let paramIndex = 1;

    if (startMonth) {
      sql += ` AND month_label >= $${paramIndex}`;
      sqlParams.push(startMonth);
      paramIndex++;
    }

    if (endMonth) {
      sql += ` AND month_label <= $${paramIndex}`;
      sqlParams.push(endMonth);
      paramIndex++;
    }

    sql += ` ORDER BY month_label DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    sqlParams.push(limit, offset);

    const result = await query(sql, sqlParams);

    // Contar total
    let countSql = `SELECT COUNT(*) as total FROM vw_fines_summary WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (startMonth) {
      countSql += ` AND month_label >= $${countParamIndex}`;
      countParams.push(startMonth);
      countParamIndex++;
    }

    if (endMonth) {
      countSql += ` AND month_label <= $${countParamIndex}`;
      countParams.push(endMonth);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // KPIs
    const multas: MultaMensual[] = result.rows;
    const totalGenerado = multas.reduce((acc, m) => acc + parseFloat(String(m.total_amount_generated)), 0);
    const totalRecaudado = multas.reduce((acc, m) => acc + parseFloat(String(m.total_collected)), 0);
    const totalPendiente = multas.reduce((acc, m) => acc + parseFloat(String(m.pending_debt)), 0);

    const kpis: KPIs = {
      totalGenerado,
      totalRecaudado,
      totalPendiente,
      tasaRecaudacion: totalGenerado > 0 ? (totalRecaudado / totalGenerado) * 100 : 0,
      mejorMes: multas.sort((a, b) => 
        parseFloat(String(b.total_collected)) - parseFloat(String(a.total_collected))
      )[0] || null
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
    console.error('❌ Error en API fines:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}