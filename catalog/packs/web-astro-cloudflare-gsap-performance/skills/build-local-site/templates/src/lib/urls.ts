// Every internal link goes through these helpers so the trailing-slash rule
// (trailingSlash: 'always') is applied in exactly one place.
export const serviceUrl = (service: string) => `/services/${service}/`;
export const areaUrl = (area: string) => `/areas/${area}/`;
export const comboUrl = (area: string, service: string) => `/services/${area}/${service}/`;
export const contactUrl = () => '/contact/';
export const aboutUrl = () => '/about/';
export const blogUrl = (slug?: string) => (slug ? `/blog/${slug}/` : '/blog/');
