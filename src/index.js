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
  })
]);

const firstTemplate = `
  <main>
    <Header title="My Blog" sub-title="its great"></Header>
    <ArticleSnippet title="my second post" sub-title="testing subtitle">
      There should be an inner post below.
      <ArticleSnippet title="inner post">
        testing this inner post
      </ArticleSnippet>
    </ArticleSnippet>
    <ArticleSnippet title="my first post">
      First post.
    </ArticleSnippet>
  </main>
`;


console.log(parser.parse(firstTemplate));