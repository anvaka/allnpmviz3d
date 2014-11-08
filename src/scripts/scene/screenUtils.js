module.exports.isSmall = isSmall;
var smallSize = 768; // this is similar to `xs` size of bootstrap

// determines whether screen size should be treated as "small"
function isSmall() {
  if (typeof window === undefined) return false;

  return window.innerWidth <= smallSize;
}
