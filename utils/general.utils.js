const waitFor = (condition, interval = 100) =>
  new Promise((resolve) => {
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });

module.exports = { waitFor };
