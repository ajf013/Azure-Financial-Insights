/**
 * Utility to export JSON data to CSV and trigger a download in the browser.
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Desired name for the CSV file
 */
export const exportToCSV = (data, fileName = 'azure-report.csv') => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        // Handle values that might contain commas
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
