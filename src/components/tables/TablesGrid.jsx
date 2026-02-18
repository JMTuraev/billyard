import TableCard from "./TableCard";

export default function TablesGrid({
  tables,
  clubId,
  startSession,
  stopSession,
  getLiveMinutes,
}) {
  if (!tables.length) {
    return (
      <div className="text-gray-400">
        No tables yet. Add your first table.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          clubId={clubId}
          startSession={startSession}
          stopSession={stopSession}
          getLiveMinutes={getLiveMinutes}
        />
      ))}
    </div>
  );
}
