import Link from 'next/link';

interface Multa {
  month_label: string;
  total_fines: number;
  total_amount_generated: number;
  total_collected: number;
  pending_debt: number;
}

export default async function Reporte3() {
  const response = await fetch('http://localhost:3000/api/reports/fines', { cache: 'no-store' });
  const data = await response.json();

  if (!data.success) {
    return <div className="p-8">Error: {data.error}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">💰 Resumen de Multas</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Volver</Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="p-3 text-left">Mes</th>
            <th className="p-3 text-center">Multas</th>
            <th className="p-3 text-right">Generado</th>
            <th className="p-3 text-right">Recaudado</th>
            <th className="p-3 text-right">Pendiente</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((m: Multa) => (
            <tr key={m.month_label} className="border-t">
              <td className="p-3">{m.month_label}</td>
              <td className="p-3 text-center">{m.total_fines}</td>
              <td className="p-3 text-right">${parseFloat(String(m.total_amount_generated)).toFixed(2)}</td>
              <td className="p-3 text-right text-green-600">${parseFloat(String(m.total_collected)).toFixed(2)}</td>
              <td className="p-3 text-right text-red-600">${parseFloat(String(m.pending_debt)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}