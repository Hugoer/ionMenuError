// tslint:disable: no-string-literal
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';
const domino = require('domino');
// import
import { AppServerModule } from 'src/main.server';

// Polyfills required for Firebase
(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');

// Faster renders in prod mode
enableProdMode();

// Export our express server
export const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist');
const APP_NAME = 'app';
const BROWSER_PATH = join(DIST_FOLDER, APP_NAME, 'browser');

// index.html template
const indexPath = join(BROWSER_PATH, 'index.html');

const template = readFileSync(indexPath).toString();

const win = domino.createWindow(template);
// global['window'] = win;
global['document'] = win.document;

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule
}));

app.set('view engine', 'html');
app.set('views', join(BROWSER_PATH));

// Serve static files
app.get('*.*', express.static(join(BROWSER_PATH)));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render(join(BROWSER_PATH, 'index.html'), { req });
});

// If we're not in the Cloud Functions environment, spin up a Node server
if (!process.env.FUNCTION_NAME) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
  });
}
