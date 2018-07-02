const Parser = require('./Parser');
const JavascriptTemplateLoader = require('./loaders/JavascriptTemplateLoader');

const parser = new Parser([
  new JavascriptTemplateLoader({
    Header: (context) => `
      <h1>
        [LOGO]
        <strong>${context.title}</strong>
        ${context['sub-title']}
      </h1>
    `,
    ArticleSnippet: (context, children) => `
      <div>
        <h2 style="color: blue">${context.title}</h2>
        ${context['sub-title'] ? `<p>${context['sub-title']}` : ''}
        <div>
            ${children}
        </div>
      </div>
    `
  }),
]);

module.exports = parser;