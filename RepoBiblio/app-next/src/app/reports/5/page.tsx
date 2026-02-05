import { query } from '../../lib/bd';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Reporte5({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams?.status;

  let sql = 'SELECT * FROM vw_inventory_health';
  const params = [];

  if (statusFilter && statusFilter !== "") {
    sql += ' WHERE inventory_status = $1';
    params.push(statusFilter);
  }
  
  sql += ' ORDER BY total_copies DESC';

  const result = await query(sql, params);
  const libros = result.rows;

  return (
    <div className="p-8 text-black bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario y Stock</h1>
        <Link href="/" className="underline text-blue-800 font-bold">Volver</Link>
      </div>

      <form className="mb-6 bg-gray-100 p-4 border rounded">
        <div className="flex gap-3 items-center">
          <label className="font-bold">Estado del Stock:</label>

          <select 
            name="status" 
            defaultValue={statusFilter || ""} 
            className="border border-black p-2 rounded min-w-[200px]"
          >
            <option value="">-- Ver Todos --</option>
            <option value="SIN STOCK">Sin Stock (0 copias)</option>
            <option value="BAJO">Bajo Stock (Menos de 2)</option>
            <option value="OK">Saludable (OK)</option>
          </select>

          <button type="submit" className="bg-black text-white px-6 py-2 rounded font-bold">
            Aplicar Filtro
          </button>
        </div>
      </form>

      <table className="w-full text-left border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-3">Libro</th>
            <th className="p-3">Categoría</th>
            <th className="p-3 text-center">Total Copias</th>
            <th className="p-3 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {libros.length === 0 ? (
            <tr><td colSpan={4} className="p-6 text-center text-xl font-bold text-red-600">No hay libros con este estado.</td></tr>
          ) : (
            libros.map((row: any, i: number) => (
              <tr key={i} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 font-bold">{row.title}</td>
                <td className="p-3">{row.category}</td>
                <td className="p-3 text-center font-bold">{row.total_copies}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 text-sm font-bold border border-black rounded
                    ${row.inventory_status === 'SIN STOCK' ? 'bg-red-200 text-red-900' : 
                      row.inventory_status === 'BAJO' ? 'bg-yellow-200 text-yellow-900' : 'bg-green-200 text-green-900'}`}>
                    {row.inventory_status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}