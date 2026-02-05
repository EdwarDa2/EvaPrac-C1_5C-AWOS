import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-10 font-sans text-black">
      <h1 className="text-4xl font-bold text-center mb-2">Biblioteca AWOS</h1>
      <p className="text-center mb-10 text-lg">Sistema de Reportes</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <MenuCard href="/reports/1" title="1. Ranking Popularidad" desc="Buscar libros más prestados" />
        <MenuCard href="/reports/2" title="2. Préstamos Vencidos" desc="Ver deudas y multas" />
        <MenuCard href="/reports/3" title="3. Finanzas" desc="Dinero recaudado y pendiente" />
        <MenuCard href="/reports/4" title="4. Socios" desc="Filtro por tasa de atrasos" />
        <MenuCard href="/reports/5" title="5. Inventario" desc="Filtrar por Bajo Stock" />
      </div>
    </div>
  );
}

function MenuCard({ href, title, desc }: { href: string, title: string, desc: string }) {
  return (
    <Link href={href} className="block p-6 border-2 border-black rounded hover:bg-black hover:text-white transition">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm opacity-80">{desc}</p>
    </Link>
  );
}