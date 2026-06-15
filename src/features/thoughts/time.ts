function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateParts(year: number, month: number, day: number) {
  return `${year}.${pad(month)}.${pad(day)}`;
}

export function formatThoughtListDate(value?: string) {
  if (!value) {
    return "未记录日期";
  }

  if (isDateOnly(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return formatDateParts(year, month, day);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未记录日期";
  }

  return formatDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatThoughtMetaTimestamp(value?: string) {
  return formatThoughtListDate(value);
}

export function shouldShowThoughtUpdatedAt(createdAt?: string, updatedAt?: string) {
  if (!createdAt || !updatedAt) {
    return false;
  }

  return createdAt !== updatedAt;
}
