import React from 'react';

const Table = ({ columns, data, emptyMessage = "No data available", keyField = "id" }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs tracking-wider">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 border-b border-slate-200">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data && data.length > 0 ? (
            data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
