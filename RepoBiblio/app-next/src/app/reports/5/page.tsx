// app/reports/5/page.tsx
import Link from 'next/link';

export default async function Reporte5({ searchParams }: any) {
  const params = await searchParams;
  const status = params?.status ?? '';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/reports/inventory?${status ? `status=${status}` : ''}`;
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  const inventario = data.data || [];

  return (
    <div className="p-8 bg-white min-h-screen text-black font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventario y Stock</h1>
        <Link href="/" className="text-blue-700 underline font-bold">Volver</Link>
      </div>

      <div className="border border-black p-6 mb-6">
        <form className="flex items-center gap-4">
          <label className="font-bold">Estado del Stock:</label>
          <select name="status" defaultValue={status} className="border border-black p-2 bg-white w-64">
            <option value="">-- Ver Todos --</option>
            <option value="SIN STOCK">SIN STOCK</option>
            <option value="BAJO">BAJO</option>
            <option value="OK">OK</option>
          </select>
          <button type="submit" className="bg-black text-white px-6 py-2 font-bold">
            Aplicar Filtro
          </button>
        </form>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-black text-white text-sm uppercase">
            <th className="p-3 text-left">Libro</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-center">Total Copias</th>
            <th className="p-3 text-right">Estado</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-4 font-bold">{item.title}</td>
              <td className="p-4 text-gray-600">{item.category}</td>
              <td className="p-4 text-center font-bold">{item.total_copies}</td>
              <td className="p-4 text-right">
                <span className={`px-3 py-1 rounded text-xs font-bold border ${
                  item.inventory_status === 'BAJO' ? 'bg-yellow-200 border-yellow-600 text-yellow-800' :
                  item.inventory_status === 'SIN STOCK' ? 'bg-red-200 border-red-600 text-red-800' :
                  'bg-green-200 border-green-600 text-green-800'
                }`}>
                  {item.inventory_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}