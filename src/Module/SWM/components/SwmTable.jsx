import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Pagination from '../../../Components/Pagination';
import { styles } from '../swmStyles';

export function SwmTable({ columns, data, getCells, firstNumber = 1, demandStyle = false }) {
  if (!data.length) return <Text selectable>No records found.</Text>;

  return (
    <ScrollView horizontal>
      <View>
        <View style={[styles.tableRow, styles.tableHeading, demandStyle && styles.demandTableHeading]}>
          {columns.map(([label, width]) => (
            <Text selectable key={label} style={[styles.tableCell, styles.tableHeadingText, { width }]}>
              {label}
            </Text>
          ))}
        </View>
        {data.map((item, index) => (
          <View key={item.id ?? index} style={[styles.tableRow, index % 2 === 1 && styles.tableStripe]}>
            {getCells(item, firstNumber + index).map((value, columnIndex) => {
              const [label, width] = columns[columnIndex];
              return (
                <View key={label} style={[styles.tableCell, { width }]}>
                  {React.isValidElement(value) ? value : <Text selectable style={demandStyle && styles.demandCellText}>{value ?? '—'}</Text>}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function PaginatedSwmTable({ data, ...tableProps }) {
  const [requestedPage, setPage] = useState(1);
  const pageSize = 5;
  const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * pageSize;

  return (
    <>
      <SwmTable {...tableProps} data={data.slice(offset, offset + pageSize)} firstNumber={offset + 1} />
      {lastPage > 1 && (
        <Pagination
          page={page}
          lastPage={lastPage}
          total={data.length}
          onPrev={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
