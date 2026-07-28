const slugify = require('slugify');

const createSlug = (value) => {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true
  });
};

const buildPagination = ({ page, limit, totalCount }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.max(Number(limit) || 10, 1);
  const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * perPage;

  return {
    currentPage: safePage,
    perPage,
    totalCount,
    totalPages,
    skip,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
    previousPage: safePage > 1 ? safePage - 1 : null,
    nextPage: safePage < totalPages ? safePage + 1 : null
  };
};

const parseSort = (sortField, allowedFields, defaultField = 'createdAt') => {
  const direction = sortField?.startsWith('-') ? -1 : 1;
  const field = (sortField || defaultField).replace(/^-/, '');

  if (!allowedFields.includes(field)) {
    return { [defaultField]: -1 };
  }

  return { [field]: direction };
};

const truncateText = (text, length = 140) => {
  if (!text || text.length <= length) {
    return text;
  }
  return `${text.slice(0, length).trim()}…`;
};

const formatDate = (date) => {
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

module.exports = {
  createSlug,
  buildPagination,
  parseSort,
  truncateText,
  formatDate
};
