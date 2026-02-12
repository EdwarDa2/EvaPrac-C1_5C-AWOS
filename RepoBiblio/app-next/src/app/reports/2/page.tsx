import Link from 'next/link';
import { query } from '@/app/lib/bd';

interface Prestamo {
  loan_id: number;
  member_name: string;
  book_title: string;
  days_overdue: number;
  severity: string;
  estimated_fine_amount: number;
}

export const dynamic = 'force-dynamic';

export default async function Reporte2() {
  try {
    const result = await query(`
      SELECT *
      FROM vw_overdue_loans
      ORDER BY days_overdue DESC
    `);

    const data: Prestamo[] = result.rows;

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">⏰ Préstamos Vencidos</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Volver
          </Link>
        </div>

        <table className="w-full border">
          <thead>
            <tr>
              <th className="p-3 text-left">Socio</th>
              <th className="p-3 text-left">Libro</th>
              <th className="p-3 text-center">Días Atraso</th>
              <th className="p-3 text-center">Severidad</th>
              <th className="p-3 text-right">Multa</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.loan_id} className="border-t">
                <td className="p-3">{p.member_name}</td>
                <td className="p-3">{p.book_title}</td>
                <td className="p-3 text-center">{p.days_overdue}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      p.severity === 'CRITICO'
                        ? 'bg-red-200 text-red-800'
                        : p.severity === 'ALTO'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {p.severity}
                  </span>
                </td>
                <td className="p-3 text-right">
                  ${Number(p.estimated_fine_amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        Error: {error instanceof Error ? error.message : 'Error desconocido'}
      </div>
    );
  }
}