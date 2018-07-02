const parse5 = require('parse5');
const utils = require('parse5-utils');

class Parser {
  constructor(extensions = []) {
    this.extensions = extensions;
    this.handleNode = this.handleNode.bind(this);
  }

  parse(str) {
    const document = utils.parseFragment(str);
    this.traverse(document, this.handleNode);
    return utils.serialize(document);
  }

  resolveExtension(componentName) {
    return this.extensions.reduce((found, next) => {
      if (found) return found;
      if (next.customComponentLoader(componentName)) {
        return next;
      }
      return null;
    }, null);
  }

  handleNode(item) {
    const extension = this.resolveExtension(item.tagName);

    if (extension) {
      const newFrag = parse5.parseFragment(
        item,
        extension.renderComponentAsString(
          item.tagName,
          extension.customComponentLoader(item.tagName),
          utils.attributesOf(item),
          utils.serialize(item),
        ),
      );

      const node = utils.createNode('span');
      newFrag.childNodes.forEach(child =>
        utils.append(node, child));

      return node;
    }

    return item;
  };

  traverse(document, cb) {
    return (document.childNodes || []).forEach((nextInput) => {
      if (nextInput.childNodes) {
        this.traverse(nextInput, cb);
      }
      const next = cb(nextInput);
      if (next.childNodes && nextInput !== next) {
        this.traverse(next, cb);
      }
      utils.replace(nextInput, next);
    }, []);
  }
}

module.exports = Parser;