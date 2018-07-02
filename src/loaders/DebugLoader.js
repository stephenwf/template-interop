class DebugLoader {
  renderComponentAsString(componentName, component, context, children) {
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
    return componentName;
  }
}

module.exports = DebugLoader;