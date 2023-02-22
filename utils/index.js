const capitalize = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

const joinProperties = (arr, property) =>
  arr.map((item) => item[property]).join(", ");

module.exports = { joinProperties, capitalize };
