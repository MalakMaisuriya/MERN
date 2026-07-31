document.addEventListener('DOMContentLoaded', () => {
  // Live Search Filter for Data Tables
  const searchInput = document.getElementById('tableSearch');
  const tableRows = document.querySelectorAll('.data-table tbody tr');

  if (searchInput && tableRows.length > 0) {
    searchInput.addEventListener('keyup', (e) => {
      const term = e.target.value.toLowerCase().trim();
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  /**
   * Delete Action Confirmation Dialog
   * Prompts the user before submitting record deletion forms.
   */
  const deleteForms = document.querySelectorAll('.form-delete');
  deleteForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const confirmAction = confirm('Are you sure you want to delete this record? This action cannot be undone.');
      if (!confirmAction) {
        e.preventDefault();
      }
    });
  });
});
