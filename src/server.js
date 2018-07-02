const Koa = require('koa');
const app = new Koa();


const stubArticles = [
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
  {title: 'My first post', body: 'Testing my first post!'},
];

app.use(async ctx => {

  const template = (articles) => `
    <main>
      <Header title="My Blog" sub-title="its great"></Header>
      ${articles.map(article => `
        <ArticleSnippet title="${article.title}">
            ${article.body}
        </ArticleSnippet>
      `).join('')}
    </main>
  `


  const parser = require('./exampleParser');
  ctx.body = parser.parse(template(stubArticles));
});

app.listen(3000);