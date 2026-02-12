import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/bd';
import { z } from 'zod';

const inventorySchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().optional(),
  status: z.enum(['SIN STOCK', 'BAJO', 'OK']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

interface Inventario {
  title: string;
  category: string;
  total_copies: number;
  available_copies: number;
  loaned_copies: number;
  lost_copies: number;
  inventory_status: string;
}

interface KPIs {
  totalLibros: number;
  copiasDisponibles: number;
  copiasEnPrestamo: number;
  copiasPerdidas: number;
  librosSinStock: number;
  librosStockBajo: number;
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
  data: Inventario[];
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
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    };

    const validated = inventorySchema.safeParse(params);
    
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

    const { q: busqueda, category, status, page, limit } = validated.data;
    const offset = (page - 1) * limit;

    // Construir query dinámica
    let sql = `SELECT * FROM vw_inventory_health WHERE title ILIKE $1`;
    const sqlParams: any[] = [`%${busqueda}%`];
    let paramIndex = 2;

    if (category) {
      sql += ` AND category = $${paramIndex}`;
      sqlParams.push(category);
      paramIndex++;
    }

    if (status) {
      sql += ` AND inventory_status = $${paramIndex}`;
      sqlParams.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY 
      CASE inventory_status 
        WHEN 'SIN STOCK' THEN 1 
        WHEN 'BAJO' THEN 2 
        WHEN 'OK' THEN 3 
      END,
      title ASC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    sqlParams.push(limit, offset);

    const result = await query(sql, sqlParams);

    // Contar total
    let countSql = `SELECT COUNT(*) as total FROM vw_inventory_health WHERE title ILIKE $1`;
    const countParams: any[] = [`%${busqueda}%`];
    let countParamIndex = 2;

    if (category) {
      countSql += ` AND category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (status) {
      countSql += ` AND inventory_status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Calcular KPIs
    const libros: Inventario[] = result.rows;
    
    const kpis: KPIs = {
      totalLibros: total,
      copiasDisponibles: libros.reduce((acc, l) => acc + parseInt(String(l.available_copies)), 0),
      copiasEnPrestamo: libros.reduce((acc, l) => acc + parseInt(String(l.loaned_copies)), 0),
      copiasPerdidas: libros.reduce((acc, l) => acc + parseInt(String(l.lost_copies)), 0),
      librosSinStock: libros.filter(l => l.inventory_status === 'SIN STOCK').length,
      librosStockBajo: libros.filter(l => l.inventory_status === 'BAJO').length
    };

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: libros,
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
    console.error('❌ Error en API inventory:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}