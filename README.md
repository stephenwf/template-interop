# Template interoperability

twig template:
```twig
<main>
  <Header title="{{ page.title }}" subtitle="{{ page.subtitle }}" />
  {% for article in articles %}
    <ArticleSnippet title="{{ article.title }}">
      {{ article.body | safe }}
    </ArticleSnippet>
  {% endfor %}
</main>
```

Would produce HTML that looked like:

```html
<main>
  <Header title="My Blog" subtitle="its great" />
  <ArticleSnippet title="my second post">
    my <b>second</b> post
  </ArticleSnippet>
  <ArticleSnippet title="my first post">
    My <b>first</b> post
  </ArticleSnippet>
</main>
```

Now this is a layout that's waiting for 2 components.
- Header
- Article snippet

Say we write the header in mustache

```mustache
<header>
  <h1>{{ title }}</h1>
  {{#subtitle}}
    <p>{{ subtitle }}</p>
  {{/subtitle}}
</header>
```

and lets write the Article snippet in React.

```jsx
import React, {Component} from 'react';

class ArticleSnippet extends Component {
  
  state = {showContent: false};
  
  render() {
    const { showContent } = this.state;
    const { thumbnail, title, innerContent } = this.props;
    return (
      <article>
        <h2>{ title }</h2>
        <button onClick={() => this.setState({ showContent: !showContent })}>
          Preview
        </button>
        <section>
          <div __dangerouslySetInnerHtml={{ html: innerContent }} />
        </section>
      </article>
    );
  }
}

export default domMountable('ArticleSnippet')(ArticleSnippet);
```

Now lets take a look at that original HTML that was exported:
```html
<main>
  <Header title="My Blog" subtitle="its great" />
  <ArticleSnippet title="my second post">
    My <b>second</b> post
  </ArticleSnippet>
  <ArticleSnippet title="my first post">
    My <b>first</b> post
  </ArticleSnippet>
</main>
```

Let's convert this into some **representative** JS to describe the concept.

```js

const document = `
<main>
  ${renderComponent('Header', { title: 'My Blog', subtitle: 'its great' })}
  ${renderComponent('ArticleSnippet', { title: 'my second post' }, `
    My <b>second</b> post
  `)}
  ${renderComponent('ArticleSnippet', { title: 'my first post' }, `
    My <b>first</b> post
  `)}
</main>
`;
```

Now we need some relationship between the templates. We could have a "discovery" service to load in paths, but they would need to remain flat:

```json
{
  "components": [
    { "type": "mustache", "path": "./mustacheComponents", "extension": ".mustache" },
    { "type": "react", "path": "./reactComponents", "extension": ".js" },
  ]
}
```

The template renders are context-less, which is the main goal. So it would be a pipeline of:

- Render template twig
  - Pass through component detection (2 found)
    - render template mustache
      - Pass through component detection (0 found)
    - render template react
      - Pass through component detection (0 found)*

So the component detection step resolves any external templates. This approach encourages atomic components
but also discourages deeply nested components as you will generally have to pass state through as strings, numbers etc, so no passing dicts through multiple levels of state.

One more extension we could add, which I wouldn't encourage is used inside components, but in top-level renderings is a sort of composition step. This example is pure HTML, no templates. Although it does pass through the component pipeline.

```html
<div>
  <context data="some.complex.dataset">
    <MyComplexComponent />
  </context>
  <context data="some.other.dataset">
    <SomeOtherComponent />
  </context>
</div>
```

One last escape hatch, that really shouldn't be used, again just using HTML:

```html
<div>
  <MyComplexComponent someProp="$eval(some.complex.dataset)" />
</div>
```

By calling it `$eval()` we should discourage using it, but it may be useful for throwing together something quickly. I think an option to disable during a production build would be useful.

So as for actually extending, a simple interface to whatever language its written in (ref: TypeScript)

```typescript

interface Component<T> {
  
  renderComponentAsString(
    componentName: string, 
    templateString: string, 
    context: object, 
    children: string
  ): string;
  
  customComponentLoader?: (componentName: string, templatePath: string) => T;
  
  getStylesheets(): Array<string>;

  getScripts(): Array<string>;
  
}
```


Lets just take a step through the original pipeline:
```js
const document = `
<main>
  ${renderComponent('Header', { title: 'My Blog', subtitle: 'its great' })}
  ${renderComponent('ArticleSnippet', { title: 'my second post' }, `
    My <b>second</b> post
  `)}
  ${renderComponent('ArticleSnippet', { title: 'my first post' }, `
    My <b>first</b> post
  `)}
</main>
`;
```

So now, `renderComponent` will simply call the correct `renderComponentAsString` depending on plugin. For resolving locations of templates, its likely there would be another interface for resolving that could be cusotmised independently of the normal component.

> Yeh but react?

Yeh, react would be different. There is a few ways I could see this working well. The first is letting this templating language know, "hey, reacts going to be looking for HTML like this" and the other is inlining ReactDOM mounts. The first would be ideal in production environments where something like Webpack is available. The latter would be great for prototyping really fast. 

Lets see the first:

```typescript
class ReactWebComponent implements Component<string> {
  
  renderComponentAsString(
    componentName: string, 
    templateString: string, 
    context: object, 
    children: string
  ): string {
    // We don't need the template string at all.
    return (
      `<div 
        data-element="{{ componentName }}"
        ${Util.toHtmlAttributes(context)}
      >${children}</div>`
    );
  }
}

```

With this, our template originally would render:

```html
<div data-element="ArticleSnippet" data-title="my first post">
  My <b>first</b> post
</div>
```

and React would search for `[data-element]` and use the attributes and inner content to populate the props. This would be done externally in webpack.

The second option, which is the depenedncy-free version:

```typescript
class ReactInlineComponent implements Component<string> {
  
  renderComponentAsString(
    componentName: string, 
    templateString: string, 
    context: object, 
    children: string
  ): string {
    const randomId = hash({ templateString, context, children }); // I dunnno?
    return (
      `<div id="${randomId}"></div>
       <script type="application/javascript">
          // private scope.
          (function(){
            ${templateString};
            ReactDOM.render(
              React.element(
                ${componentName}, 
                ${JSON.stringify({ ...context, innerContent: children })}
              ),
              document.getElementById('${randomId}')
            );
          })()
       </script>
      `
    );
    
  }
  
  customComponentLoader(componentName: string, templatePath: string): string {
    // Compile to Browser-friendly JS.
    return babel.compile({ /* ... */ });
  }
                         
  getScripts(): Array<string> {
    return process.env.NODE_ENV === 'production' ? [
        'https://unpkg.com/react@16/umd/react.production.js',
        'https://unpkg.com/react-dom@16/umd/react-dom.production.js',
      ] : [
        'https://unpkg.com/react@16/umd/react.development.js',
       'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
    ]   
  }
}
```

One last trick. Server side rendering or static rendering of React. (note: using react in this, because its what I know, insert anything else similar.)

```typescript

class ReactStaticComponent implements Component<React.Component> {
  
  renderComponentAsString(
    componentName: string, 
    Component: React.Component, 
    context: object, 
    children: string
  ): string {
    return ReactDOMServer.renderToStaticMarkup(
      <Component {...context} innerContent={children} />
    );
  }
  
  customComponentLoader(componentName: string, templatePath: string): React.Component {
    return <React.Component>require(templatePath);
  }
}
```

This will create static markup from the react components. Note: this won't attach any dom events, you have to change `renderToStaticMarkup` to `renderToString` and call `ReactDOM.hydrate` on it, but its really not far off that!
