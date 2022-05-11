/**
 * This method extracts the URI information from a URL.
 *
 * @param {string} url The URL to be converted to URI
 */
const extractUri = (url) => {
  try {
    if (url.startsWith('/')) { // Already a relative URL
      return url;
    }

    const { origin, href } = new URL(url);
    if (origin) return href.slice(href.indexOf(origin) + origin.length);
  } catch (error) {
    console.warn('having problems converting URL to URI:', error);
  }

  return url;
}

module.exports= { 
  extractUri
};