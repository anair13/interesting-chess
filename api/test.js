// Simple test API route to verify deployment
module.exports = async function handler(req, res) {
  res.json({ 
    message: 'API routes are working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
