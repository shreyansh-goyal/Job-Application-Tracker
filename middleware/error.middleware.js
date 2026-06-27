const errorHandler = (err, req, res, next) => {
  console.log("error : ", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
};

module.exports = errorHandler;
