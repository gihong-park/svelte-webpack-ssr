require('../scss/index.scss');

const fs = require('fs');
const path = require('path');

const Home = require('../components/pages/Home.svelte').default;
const Fruits = require('../components/pages/Fruits.svelte').default;

const dev = process.env.DEV === 'true';
let AFRAME;

// STATIC
const pathStaticDir = path.resolve(__dirname, './static');
const files = fs.readdirSync(pathStaticDir);
const stylesFilename = files.filter((filename) => filename.includes('styles'));
const homeJsFilename = files.filter((filename) => filename.includes('Home'));
const fruitsJsFilename = files.filter((filename) => filename.includes('Fruits'));
const newJsFilename = files.filter((filename) => filename.includes('New'));

// init
const fastify = require('fastify')({
  ignoreTrailingSlash: true,
  logger: true
});

fastify.register(require('fastify-compress'));

fastify.register(require('fastify-static'), {
  root: pathStaticDir
});
// <link rel="stylesheet" href="/${stylesFilename}" />

function renderPage(head, body, jsFilename, data) {
  return `
	<html>
		<head>
			<script>
				const HYDRATION_DATA = ${JSON.stringify(data)}
			</script>
      <script src="https://aframe.io/releases/1.2.0/aframe.js"></script>
      <script src="https://mixedreality.mozilla.org/ammo.js/builds/ammo.wasm.js"></script>
      <script src="http://cdn.jsdelivr.net/gh/n5ro/aframe-physics-system@v4.0.1/dist/aframe-physics-system.js"></script>
			<script src="${jsFilename}" ></script>
		</head>
		<body>
			${head}
			<div id="page">${body}</div>
		</body>
	</html>
	`
}

fastify.route({
  method: 'GET',
  url: '/',
  handler: (request, reply) => {
    reply.header('Content-Type', 'text/html');


    const { html, head } = Home.render();
    reply.send(renderPage(head, html, homeJsFilename, {}));
  }
});

fastify.route({
  method: 'GET',
  url: '/fruits',
  handler: (request, reply) => {
    reply.header('Content-Type', 'text/html');

    const data = {
      fruits: ['Apple', 'Mango', 'Banana']
    };

    const { html, head } = Fruits.render(data);

    reply.send(renderPage(head, html, fruitsJsFilename, data));
  }
});

fastify.listen(process.env.PORT || '8888', '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
});