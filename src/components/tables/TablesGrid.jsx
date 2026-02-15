import TableCard from "./TableCard";

export default function TablesGrid({ tables, clubId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          clubId={clubId}
        />
      ))}
    </div>
  );
}
