function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateParts(year: number, month: number, day: number) {
  return `${year}.${pad(month)}.${pad(day)}`;
}

export function getThoughtDateParts(value?: string) {
  if (!value) {
    return null;
  }

  if (isDateOnly(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return { day, month, year };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function formatThoughtListDate(value?: string) {
  const dateParts = getThoughtDateParts(value);

  if (!dateParts) {
    return "未记录日期";
  }

  return formatDateParts(dateParts.year, dateParts.month, dateParts.day);
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
