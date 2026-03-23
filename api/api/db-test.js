module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: 'DB test working ✅',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};
