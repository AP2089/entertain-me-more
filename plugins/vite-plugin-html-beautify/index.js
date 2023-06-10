import jsBeautify from 'js-beautify';

const vitePluginHtmlBeautify = (options = {}) => ({
  name: 'vite-plugin-html-beautify',
  transformIndexHtml(html) {
    const data = html.replace('<script type="module"', '<script type="text/javascript" async');
    
    return jsBeautify.html_beautify(data, options);
  },
});

export default vitePluginHtmlBeautify;