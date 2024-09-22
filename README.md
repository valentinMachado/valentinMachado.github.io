## Getting started

First install node modules:

```
npm i
```

### Deployment

To build a production bundle run:

```
npm run build
```

Since the deployment is handle by [github pages](https://pages.github.com/) (which can only deals with [static website](https://en.wikipedia.org/wiki/Static_web_page)) there isn't deployment CLI in the project.

To deploy it yourself create a static backend serving the root of this project.

### Development

To run the project in a dev mode (basically run a static express backend and build a dev bundle)

```
npm run dev
```

then browse to [http://localhost:8000/](http://localhost:8000/)
