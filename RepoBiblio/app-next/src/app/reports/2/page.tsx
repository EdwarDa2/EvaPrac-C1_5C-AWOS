import { query } from '../../lib/bd';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default async function ReporteMorosos() {
  const result = await query('SELECT * FROM vw_overdue_loans ORDER BY days_overdue DESC');
  const morosos = result.rows;
  const totalDeuda = morosos.reduce((acc: number, row: any) => acc + Number(row.estimated_fine_amount), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">🚨 Préstamos Vencidos</h1>
          <Link href="/" className="text-sm font-bold text-blue-700 hover:underline">Volver</Link>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-red-600 shadow-sm mb-6 flex justify-between items-center">
          <p className="text-gray-800 font-bold">Deuda Estimada Total</p>
          <p className="text-2xl font-black text-red-700">${totalDeuda.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-200 text-gray-800 uppercase font-bold">
              <tr>
                <th className="p-3">Socio</th>
                <th className="p-3">Libro</th>
                <th className="p-3 text-center">Días</th>
                <th className="p-3 text-center">Nivel</th>
                <th className="p-3 text-right">Multa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {morosos.map((row: any) => (
                <tr key={row.loan_id} className="hover:bg-red-50">
                  <td className="p-3 font-bold text-gray-900">{row.member_name}</td>
                  <td className="p-3 text-gray-700">{row.book_title}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{row.days_overdue}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-black ${
                      row.severity === 'CRITICO' ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'
                    }`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-red-700">${row.estimated_fine_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}