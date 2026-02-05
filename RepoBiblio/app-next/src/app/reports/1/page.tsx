import { query } from '../../lib/bd';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Reporte1({ searchParams }: { searchParams: { q?: string } }) {
  const busqueda = searchParams?.q || "";

  const sql = `
    SELECT * FROM vw_most_borrowed_books 
    WHERE title ILIKE $1 OR author ILIKE $1 
    ORDER BY ranking ASC LIMIT 20
  `;

  const result = await query(sql, [`%${busqueda}%`]);
  const libros = result.rows;

  return (
    <div className="p-8 text-black bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buscador de Popularidad</h1>
        <Link href="/" className="underline text-blue-800 font-bold">Volver</Link>
      </div>

      <form className="mb-6 flex gap-2 border p-4 bg-gray-100 rounded">
        <label className="font-bold self-center">Buscar:</label>
        <input 
          type="text" 
          name="q" 
          defaultValue={busqueda}
          placeholder="Escribe título o autor..." 
          className="border border-black p-2 w-full rounded"
        />
        <button type="submit" className="bg-black text-white px-6 py-2 rounded font-bold">
          Buscar
        </button>
      </form>

      <table className="w-full text-left border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-3 border border-white"># Rank</th>
            <th className="p-3 border border-white">Título</th>
            <th className="p-3 border border-white">Autor</th>
            <th className="p-3 border border-white">Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
          {libros.map((libro: any) => (
            <tr key={libro.book_id} className="hover:bg-gray-100 border-b border-gray-300">
              <td className="p-3 font-bold">{libro.ranking}</td>
              <td className="p-3">{libro.title}</td>
              <td className="p-3">{libro.author}</td>
              <td className="p-3 font-mono font-bold text-center">{libro.total_loans}</td>
            </tr>
          ))}
          {libros.length === 0 && (
            <tr><td colSpan={4} className="p-4 text-center">No se encontraron libros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}