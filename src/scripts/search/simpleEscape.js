/**
 * Naive way to escape HTML tags
 */
module.exports = escapeHtml;

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return string.replace(/[&<>"'\/]/g, function(s) {
    return entityMap[s];
  });
}
