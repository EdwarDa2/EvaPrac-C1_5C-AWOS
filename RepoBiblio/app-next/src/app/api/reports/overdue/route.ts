import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/bd';
import { z } from 'zod';

const overdueSchema = z.object({
  minDays: z.coerce.number().int().min(0).optional().default(0),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

interface PrestamoVencido {
  loan_id: number;
  member_name: string;
  book_title: string;
  days_overdue: number;
  severity: string;
  estimated_fine_amount: number;
}

interface KPIs {
  totalVencidos: number;
  totalMultasEstimadas: number;
  prestamoCritico: PrestamoVencido | null;
  promedioAtraso: number;
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
  data: PrestamoVencido[];
  kpis: KPIs;
  pagination: Pagination;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

type ApiResponse = SuccessResponse | ErrorResponse;

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = {
      minDays: searchParams.get('minDays') || '0',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    };

    const validated = overdueSchema.safeParse(params);

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

    const { minDays, page, limit } = validated.data;
    const offset = (page - 1) * limit;

    // =========================
    // Query principal usando VIEW
    // =========================

    const sql = `
      SELECT *
      FROM vw_overdue_loans
      WHERE days_overdue >= $1
      ORDER BY days_overdue DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [minDays, limit, offset]);

    // =========================
    // Conteo total
    // =========================

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM vw_overdue_loans
      WHERE days_overdue >= $1
    `;

    const countResult = await query(countSql, [minDays]);
    const total = countResult.rows[0]?.total ?? 0;

    const prestamos: PrestamoVencido[] = result.rows;

    // =========================
    // KPIs
    // =========================

    const totalMultasEstimadas = prestamos.reduce(
      (acc, p) => acc + Number(p.estimated_fine_amount),
      0
    );

    const promedioAtraso =
      prestamos.length > 0
        ? prestamos.reduce((acc, p) => acc + p.days_overdue, 0) /
          prestamos.length
        : 0;

    const prestamoCritico =
      prestamos.length > 0
        ? prestamos.reduce((max, p) =>
            p.days_overdue > max.days_overdue ? p : max
          )
        : null;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: prestamos,
      kpis: {
        totalVencidos: total,
        totalMultasEstimadas,
        prestamoCritico,
        promedioAtraso
      },
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
    console.error('❌ Error en API overdue:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}