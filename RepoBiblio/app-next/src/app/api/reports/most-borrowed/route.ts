import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/bd';
import { z } from 'zod';


const searchSchema = z.object({
  q: z.string().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

interface Libro {
  book_id: number;
  title: string;
  author: string;
  total_loans: number;
  ranking: number;
}

interface KPIs {
  totalLibros: number;
  libroMasPopular: Libro | null;
  promedioPrestamos: number;
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
  data: Libro[];
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
    // 1. Obtener parámetros de URL
    const searchParams = request.nextUrl.searchParams;
    const params = {
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    };

    // 2. Validar con Zod
    const validated = searchSchema.safeParse(params);
    
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

    const { q: busqueda, page, limit } = validated.data;
    const offset = (page - 1) * limit;

    // 3. Query principal - Obtener libros
    const sql = `
      SELECT * FROM vw_most_borrowed_books 
      WHERE title ILIKE $1 OR author ILIKE $1 
      ORDER BY ranking ASC 
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [`%${busqueda}%`, limit, offset]);

    // 4. Query para contar total de resultados
    const countSql = `
      SELECT COUNT(*) as total 
      FROM vw_most_borrowed_books 
      WHERE title ILIKE $1 OR author ILIKE $1
    `;
    const countResult = await query(countSql, [`%${busqueda}%`]);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // 5. Calcular KPIs
    const libros: Libro[] = result.rows;
    const kpis: KPIs = {
      totalLibros: total,
      libroMasPopular: libros[0] || null,
      promedioPrestamos: libros.length > 0
        ? libros.reduce((acc, l) => acc + parseInt(String(l.total_loans)), 0) / libros.length
        : 0
    };

    // 6. Calcular paginación
    const totalPages = Math.ceil(total / limit);
    const pagination: Pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    // 7. Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: libros,
      kpis,
      pagination
    });

  } catch (error) {
    console.error('❌ Error en API most-borrowed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor al obtener datos' 
      },
      { status: 500 }
    );
  }
}