// app/reports/4/page.tsx
import Link from 'next/link';

export default async function Reporte4({ searchParams }: any) {
  const params = await searchParams;
  const minLoans = params?.minLoans ?? '0';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/reports/member-activity?minLoans=${minLoans}`, { cache: 'no-store' });
  const data = await response.json();
  const socios = data.data || [];

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Actividad de Socios</h1>
        <Link href="/" className="text-blue-700 underline font-bold">Volver</Link>
      </div>

      <div className="border border-black p-6 mb-6">
        <form className="flex items-center gap-4">
          <label className="font-bold">Mostrar morosidad mayor a:</label>
          <input
            type="number"
            name="minLoans"
            defaultValue={minLoans}
            className="border border-black p-2 w-20 text-center"
          />
          <span className="font-bold">%</span>
          <button type="submit" className="bg-black text-white px-6 py-2 font-bold">
            Filtrar
          </button>
        </form>
      </div>

      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white text-sm uppercase">
            <th className="border border-black p-3 text-left">Socio</th>
            <th className="border border-black p-3 text-left">Email</th>
            <th className="border border-black p-3 text-right">Préstamos Totales</th>
            <th className="border border-black p-3 text-right">Tasa Atraso</th>
          </tr>
        </thead>
        <tbody>
          {socios.map((s: any) => (
            <tr key={s.member_id} className="border-b border-gray-200">
              <td className="p-3 font-bold">{s.member_name}</td>
              <td className="p-3 text-gray-600">{s.member_name.toLowerCase().replace(' ', '')}@mail.com</td>
              <td className="p-3 text-right">{s.total_loans}</td>
              <td className={`p-3 text-right font-bold ${Number(s.late_return_rate) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Number(s.late_return_rate).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}