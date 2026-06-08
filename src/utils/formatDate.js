export const formatDate = (dateStringOrObject, format = 'dd/mm/yyyy') => {
  if (!dateStringOrObject) return '';
  
  const d = new Date(dateStringOrObject);
  if (isNaN(d.getTime())) return String(dateStringOrObject);

  const day = d.getDate().toString().padStart(2, '0');
  const d_single = d.getDate().toString();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const m_single = (d.getMonth() + 1).toString();
  const year = d.getFullYear().toString();
  const yy = year.slice(-2);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mmm = monthNames[d.getMonth()];

  switch (format) {
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    case 'mm/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'dd/mm/yy':
      return `${day}/${month}/${yy}`;
    case 'mm/dd/yy':
      return `${month}/${day}/${yy}`;
    case 'dd MMM yyyy':
      return `${d_single} ${mmm} ${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};
