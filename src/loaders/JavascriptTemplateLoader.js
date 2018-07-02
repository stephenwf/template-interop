class JavascriptTemplateLoader {
  constructor(javascriptTemplates = {}) {
    this.templates = Object.keys(javascriptTemplates).reduce((acc, next)=>{
      acc[next.toLocaleLowerCase()] = javascriptTemplates[next];
      return acc;
    }, {});
  }

  renderComponentAsString(componentName, component, context, children) {
    return component(context, children);
  }

  customComponentLoader(componentName, templatePath) {
    if (this.templates[componentName]) {
      return this.templates[componentName];
    }
    return null;
  }
}

module.exports = JavascriptTemplateLoader;