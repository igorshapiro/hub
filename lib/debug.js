exports.showError = function(err) {
  console.error(err);
  if (err.stack) console.error(err.stack);
};
