// Fail before a cloud build can embed a development address or backend secret.
function validateBuild(profile, env) {
  for (const key of Object.keys(env)) {
    if (/^EXPO_PUBLIC_.*(?:SECRET|TOKEN|PASSWORD|DATABASE|API_KEY)/i.test(key) && env[key]) {
      throw new Error('Backend credentials must not be embedded in the mobile application.');
    }
  }
  const address = env.EXPO_PUBLIC_API_URL || '';
  if (profile === 'design-preview') {
    if (env.EXPO_PUBLIC_SAMPLE_MODE !== 'true') throw new Error('Explicit sample mode is required for the design preview.');
    if (address) throw new Error('The design preview must use sample data without a backend.');
    return;
  }
  if (env.EXPO_PUBLIC_SAMPLE_MODE === 'true') throw new Error('Connected builds must not use sample mode.');
  let url;
  try { url = new URL(address); } catch { throw new Error('Configure a verified HTTPS backend before building a connected application.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' ||
      url.hostname === 'localhost' || url.hostname.endsWith('.local') || url.hostname.endsWith('.localhost') ||
      url.hostname.endsWith('.test') || url.hostname.endsWith('.invalid') || url.hostname.endsWith('.example') ||
      /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':') || !url.hostname.includes('.')) {
    throw new Error('Connected builds require a public HTTPS backend origin without credentials, paths or development addresses.');
  }
}
module.exports = { validateBuild };
if (require.main === module) {
  try {
    validateBuild(process.env.EAS_BUILD_PROFILE, process.env);
    console.log('Mobile build configuration checked; values withheld.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
