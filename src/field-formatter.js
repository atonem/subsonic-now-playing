// If a field is defined here, it will get formatted before printed on screen
const fieldFormatter = {
  suffix: value => `.${value}`,
  bitRate: value => `${value} kb/s`,
  size: value => `${parseFloat(value / Math.pow(1024, 2)).toFixed(2)} MB`,
  duration: value => {
    var date = new Date(null);
    date.setSeconds(value);
    if (value < 600) {
      // Under 10m, m:ss
      return date.toISOString().substr(15, 4);
    } else if (value < 3600) {
      // Under 1h, mm:ss
      return date.toISOString().substr(14, 5);
    } else if (value < 36000) {
      // Under 10h, h:mm:ss
      return date.toISOString().substr(12, 7);
    } else {
      // Over an hour, hh:mm:ss
      return date.toISOString().substr(11, 8);
    }
  },

};
