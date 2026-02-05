import { query } from '../../lib/bd';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default async function ReporteFinanzas() {
  const result = await query(`SELECT * FROM vw_fines_summary ORDER BY month_label DESC`);
  const finanzas = result.rows;
  const deudaTotal = finanzas.reduce((acc: number, row: any) => acc + Number(row.pending_debt), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">💵 Resumen Financiero</h1>
          <Link href="/" className="text-sm font-bold text-blue-700 hover:underline">Volver</Link>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-green-600 shadow-sm mb-6 flex justify-between items-center">
          <p className="text-gray-800 font-bold">Pendiente de Cobro</p>
          <p className="text-2xl font-black text-green-800">${deudaTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-200 text-gray-800 uppercase font-bold">
              <tr>
                <th className="p-3">Mes</th>
                <th className="p-3 text-center">Multas</th>
                <th className="p-3 text-right">Generado</th>
                <th className="p-3 text-right">Cobrado</th>
                <th className="p-3 text-right">Deuda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {finanzas.map((row: any) => (
                <tr key={row.month_label} className="hover:bg-green-50">
                  <td className="p-3 font-black text-gray-900">{row.month_label}</td>
                  <td className="p-3 text-center font-medium text-gray-800">{row.total_fines}</td>
                  <td className="p-3 text-right text-gray-600">${Number(row.total_amount_generated).toFixed(2)}</td>
                  <td className="p-3 text-right text-green-700 font-bold">+${Number(row.total_collected).toFixed(2)}</td>
                  <td className="p-3 text-right text-red-600 font-black">-${Number(row.pending_debt).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}