import { useEffect } from 'react';

/**
 * Custom Hook for Dynamic SEO Title, Description, and Canonical URL
 */
export const useSEO = ({ title, description, canonical, ogImage }) => {
  useEffect(() => {
    // 1. Update Title
    const baseTitle = 'CommunityConnect';
    const fullTitle = title ? `${title} | ${baseTitle}` : 'CommunityConnect | Hyperlocal Community Issue Mapping & Resolution Portal';
    document.title = fullTitle;

    // 2. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        description ||
          'Report neighborhood civic issues, track municipal resolution in real-time, view verified before-and-after photo evidence, and measure community impact.'
      );
    }

    // 3. Update Open Graph Meta Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);

    if (ogImage) {
      const ogImgTag = document.querySelector('meta[property="og:image"]');
      if (ogImgTag) ogImgTag.setAttribute('content', ogImage);
    }

    // 4. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical && canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    }

    // Scroll to top on page transition
    window.scrollTo(0, 0);
  }, [title, description, canonical, ogImage]);
};
