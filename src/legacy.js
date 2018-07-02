const parse5 = require('parse5');
const utils = require('parse5-utils');

const firstTemplate = `
  <main>
    <Header title="My Blog" sub-title="its great"></Header>
    <ArticleSnippet title="my second post" sub-title="testing this">
      There should be an inner post below me!
      <ArticleSnippet title="inner port">
        testing this inner post
      </ArticleSnippet>
    </ArticleSnippet>
    <ArticleSnippet title="my first post">
      Oh its <b>good!</b>
    </ArticleSnippet>
  </main>
`;

class CustomLoader {
  renderComponentAsString(componentName, context, children) {
    return `
    <div data-name="${componentName}">
      <ul>${
      context ? Object.keys(context).map((key) => `
          <li>${key} - ${context[ key ]}</li>  
        `).join('') : ''}
      </ul>
      ${children}
    </div>
  `;
  }

  customComponentLoader(componentName, templatePath) {
    return '';
  }
}

const loader = new CustomLoader();

const document = utils.parseFragment(firstTemplate);

function traverse(document, cb) {
  return (document.childNodes || []).forEach((nextInput) => {
    if (nextInput.childNodes) {
      traverse(nextInput, cb);
    }
    const next = cb(nextInput);
    if (next.childNodes && nextInput !== next) {
      traverse(next, cb);
    }
    utils.replace(nextInput, next);
  }, []);
}

const newDom = traverse(document, (item) => {
  if (item.tagName === 'articlesnippet') {
    const newFrag = parse5.parseFragment(
      item,
      loader.renderComponentAsString(
        item.tagName, utils.attributesOf(item), utils.serialize(item),
      ),
    );

    const node = utils.createNode('span');
    newFrag.childNodes.forEach(child =>
      utils.append(node, child));

    return node;
  }

  return item;
});

console.log(utils.serialize(document));
