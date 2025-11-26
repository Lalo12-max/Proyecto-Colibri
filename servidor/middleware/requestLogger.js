export function requestLogger(req, res, next) {
  console.log("----- Nueva petición -----");
  console.log("Origin:", req.headers.origin);
  console.log("URL:", req.originalUrl);
  console.log("-------------------------");
  const start = Date.now();

  const mask = (obj) => {
    try {
      const o = typeof obj === 'object' && obj ? { ...obj } : {};
      if ('password' in o) o.password = '<redacted>';
      if ('authorization' in (req.headers || {})) {
        // eslint-disable-next-line no-param-reassign
        req.headers.authorization = '<redacted>';
      }
      if ('access_token' in o) o.access_token = '<redacted>';
      if ('refresh_token' in o) o.refresh_token = '<redacted>';
      return o;
    } catch {
      return {};
    }
  };

  const bodyPreview = mask(req.body);

  console.log(
    `[REQ] ${req.method} ${req.originalUrl} ip=${req.ip} body=${JSON.stringify(bodyPreview)}`
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[RES] ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${duration}ms`
    );
  });

  next();
}
