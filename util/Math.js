module.exports = {
  round: (value, decimals) => Number(`${Math.round(`${value}e${decimals || 2}`)}e-${decimals || 2}`),
};
