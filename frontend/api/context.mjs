export default {
  fetch() {
    return Response.json({
      demo: false,
      authenticated_proxy: Boolean(process.env.STANDX_DEMO_API_KEY),
      public_demo: Boolean(process.env.STANDX_DEMO_API_KEY),
      hosted: true,
      backend_configured: Boolean(process.env.STANDX_API_ORIGIN),
      max_upload_bytes: 4_000_000,
      notice: process.env.STANDX_API_ORIGIN ? null :
        'Frontend preview only. The recommendation backend is not configured. Recommendations, directory and audit history are unavailable online.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  },
};
