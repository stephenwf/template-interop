module.exports = `
  <main>
    <Header title="My Blog" sub-title="its great"></Header>
    <ArticleSnippet title="my second post" sub-title="testing subtitle">
      There should be an inner post below me!
      <ArticleSnippet title="inner post">
        testing this inner post
      </ArticleSnippet>
    </ArticleSnippet>
    <ArticleSnippet title="my first post">
      Oh its <strong>good!</strong>
    </ArticleSnippet>
  </main>
`;