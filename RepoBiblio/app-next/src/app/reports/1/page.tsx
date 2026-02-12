// app/reports/1/page.tsx
import Link from 'next/link';

export default async function Reporte1({ searchParams }: any) {
  const params = await searchParams;
  const busqueda = params?.q ?? '';
  const page = Number(params?.page ?? 1);
  const limit = 5; // Cantidad de libros por página

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Llamamos a la API pasando 'q', 'page' y 'limit'
  const url = `${baseUrl}/api/reports/most-borrowed?q=${encodeURIComponent(busqueda)}&page=${page}&limit=${limit}`;
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  
  const libros = data.data || [];
  const { pagination } = data;

  return (
    <div className="p-8 bg-white min-h-screen text-black font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Buscador de Popularidad</h1>
        <Link href="/" className="text-blue-700 underline font-bold">Volver</Link>
      </div>

      {/* Buscador - Recuadro Negro */}
      <div className="border border-black p-6 mb-6">
        <form className="flex items-center gap-4">
          <label className="font-bold text-lg">Buscar:</label>
          <input
            type="text"
            name="q"
            defaultValue={busqueda}
            placeholder="Escribe título o autor..."
            className="flex-1 border border-black p-2 outline-none"
          />
          <button type="submit" className="bg-black text-white px-8 py-2 font-bold uppercase tracking-wider">
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla con Bordes Negros */}
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="border border-black p-3 text-left w-20"># Rank</th>
            <th className="border border-black p-3 text-left">Título</th>
            <th className="border border-black p-3 text-left">Autor</th>
            <th className="border border-black p-3 text-right">Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
          {libros.length > 0 ? (
            libros.map((libro: any) => (
              <tr key={libro.book_id} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 font-bold border-x border-gray-200">{libro.ranking}</td>
                <td className="p-3 border-x border-gray-200">{libro.title}</td>
                <td className="p-3 border-x border-gray-200">{libro.author}</td>
                <td className="p-3 text-right font-bold border-x border-gray-200">{libro.total_loans}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-10 text-center text-gray-500">No se encontraron resultados</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* CONTROLES DE PAGINACIÓN (Lo que faltaba) */}
      <div className="mt-8 flex justify-between items-center border-t border-black pt-4">
        <div className="text-sm font-bold">
          Página {pagination?.page || 1} de {pagination?.totalPages || 1}
        </div>
        
        <div className="flex gap-4">
          {pagination?.hasPrev ? (
            <Link 
              href={`/reports/1?q=${busqueda}&page=${page - 1}`}
              className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 transition-colors"
            >
              ← ANTERIOR
            </Link>
          ) : (
            <span className="border-2 border-gray-300 px-4 py-2 font-bold text-gray-300 cursor-not-allowed">
              ← ANTERIOR
            </span>
          )}

          {pagination?.hasNext ? (
            <Link 
              href={`/reports/1?q=${busqueda}&page=${page + 1}`}
              className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 transition-colors"
            >
              SIGUIENTE →
            </Link>
          ) : (
            <span className="border-2 border-gray-300 px-4 py-2 font-bold text-gray-300 cursor-not-allowed">
              SIGUIENTE →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}