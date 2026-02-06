import { query } from '../../lib/bd';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Reporte4(props: { searchParams: Promise<{ min?: string }> }) {
  const searchParams = await props.searchParams;
  const minRate = Number(searchParams?.min) || 0;

  const result = await query(
    `SELECT * FROM vw_member_activity WHERE late_return_rate >= $1 ORDER BY late_return_rate DESC LIMIT 50`,
    [minRate]
  );

  return (
    <div className="p-8 text-black bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actividad de Socios</h1>
        <Link href="/" className="underline text-blue-800 font-bold">Volver</Link>
      </div>

      <form className="mb-6 flex gap-2 items-center bg-gray-100 p-4 border rounded">
        <span className="font-bold">Mostrar morosidad mayor a:</span>
        <input 
          type="number" 
          name="min" 
          defaultValue={minRate}
          className="border border-black p-2 w-20 text-center"
        />
        <span className="font-bold">%</span>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded font-bold ml-2">Filtrar</button>
      </form>

      <table className="w-full text-left border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-3">Socio</th>
            <th className="p-3">Email</th>
            <th className="p-3 text-center">Préstamos Totales</th>
            <th className="p-3 text-right">Tasa Atraso</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((socio: any) => (
            <tr key={socio.member_id} className="border-b border-gray-300">
              <td className="p-3 font-bold">{socio.name}</td>
              <td className="p-3">{socio.email}</td>
              <td className="p-3 text-center">{socio.total_loans}</td>
              <td className={`p-3 text-right font-bold ${Number(socio.late_return_rate) > 20 ? 'text-red-600' : 'text-green-600'}`}>
                {socio.late_return_rate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}