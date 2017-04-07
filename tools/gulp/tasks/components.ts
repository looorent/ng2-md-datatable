import { task, watch } from 'gulp';
import * as path from 'path';

import { SOURCE_ROOT, PROJECT_ROOT, DIST_ROOT } from '../constants';
import { sassBuildTask, tsBuildTask, execNodeTask, copyTask, sequenceTask } from '../task_helpers';
import { writeFileSync } from 'fs';

// No typings for these.
const inlineResources = require('../../../scripts/inline-resources');
const rollup = require('rollup').rollup;

// NOTE: there are two build "modes" in this file, based on which tsconfig is used.
// When `tsconfig.json` is used, we are outputting ES6 modules and a UMD bundle. This is used
// for serving and for release.
//
// When `tsconfig-spec.json` is used, we are outputting CommonJS modules. This is used
// for unit tests (karma).

/** Path to the root of the Angular Material component library. */
const componentsDir = SOURCE_ROOT;

/** Path to the tsconfig used for ESM output. */
const tsconfigPath = path.relative(PROJECT_ROOT, path.join(componentsDir, 'tsconfig.json'));

/** [Watch task] Rebuilds (ESM output) whenever ts, scss, or html sources change. */
task(':watch:components', () => {
  watch(path.join(componentsDir, '**/*.ts'), [':build:components:rollup']);
  watch(path.join(componentsDir, '**/*.scss'), [':build:components:rollup']);
  watch(path.join(componentsDir, '**/*.html'), [':build:components:rollup']);
});

/** [Watch task] Rebuilds for tests (CJS output) whenever ts, scss, or html sources change. */
task(':watch:components:spec', () => {
  watch(path.join(componentsDir, '**/*.ts'), [':build:components:spec']);
  watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
});

/** Builds component typescript only (ESM output). */
task(':build:components:ts', tsBuildTask(componentsDir, 'tsconfig-srcs.json'));

/** Builds components typescript for tests (CJS output). */
task(':build:components:spec', tsBuildTask(componentsDir, 'tsconfig.json'));

/** Copies assets (html, markdown) to build output. */
task(':build:components:assets', copyTask([
  path.join(componentsDir, '**/*.scss'),
  path.join(PROJECT_ROOT, 'README.md'),
  path.join(PROJECT_ROOT, 'package.json'),
], DIST_ROOT));

/** Builds scss into css. */
task(':build:components:scss', sassBuildTask(
  DIST_ROOT, componentsDir, [componentsDir]
));

/** Builds the UMD bundle for all of Angular Material. */
task(':build:components:rollup', [':build:components:inline'], () => {
  const globals: { [name: string]: string } = {
    // Angular dependencies
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/material': 'ng.material',

    // Rxjs dependencies
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/add/observable/of': 'Rx.Observable.prototype',
    'rxjs/add/operator/combineLatest': 'Rx.Observable.prototype',
    'rxjs/add/operator/do': 'Rx.Observable.prototype',
    'rxjs/add/operator/filter': 'Rx.Observable.prototype',
    'rxjs/add/operator/let': 'Rx.Observable.prototype',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/merge': 'Rx.Observable.prototype',
    'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/add/operator/pluck': 'Rx.Observable.prototype',
    'rxjs/add/operator/takeUntil': 'Rx.Observable.prototype',
    '@ngrx/core/add/operator/select': 'Rx.Observable.prototype',

    // ngrx/store
    '@ngrx/core': 'ngrx.core',
    '@ngrx/store': 'ngrx.store',
    '@ngrx/store-devtools': 'ngrx.store-devtools',
  };

  // Rollup the UMD bundle from all ES5 + imports JavaScript files built.
  return rollup({
    entry: path.join(DIST_ROOT, 'index.js'),
    context: 'this',
    external: Object.keys(globals)
  }).then((bundle: { generate: any }) => {
    const result = bundle.generate({
      moduleName: 'md-datatable',
      format: 'umd',
      globals,
      sourceMap: true,
      dest: path.join(DIST_ROOT, 'md-datatable.umd.js')
    });

    // Add source map URL to the code.
    result.code += '\n\n//# sourceMappingURL=./md-datatable.umd.js.map\n';
    // Format mapping to show properly in the browser. Rollup by default will put the path
    // as relative to the file, and since that path is in src/lib and the file is in
    // dist/@angular/material, we need to kill a few `../`.
    result.map.sources = result.map.sources.map((s: string) => s.replace(/^(\.\.\/)+/, ''));

    writeFileSync(path.join(DIST_ROOT, 'md-datatable.umd.js'), result.code, 'utf8');
    writeFileSync(path.join(DIST_ROOT, 'md-datatable.umd.js.map'), result.map, 'utf8');
  });
});

/** Builds components with resources (html, css) inlined into the built JS (ESM output). */
task(':build:components:inline', sequenceTask(
  [':build:components:ts', ':build:components:scss', ':build:components:assets'],
  ':inline-resources',
));

/** Inlines resources (html, css) into the JS output (for either ESM or CJS output). */
task(':inline-resources', () => inlineResources(DIST_ROOT));

/** Builds components to ESM output and UMD bundle. */
task('build:components', [':build:components:rollup']);

/** Generates metadata.json files for all of the components. */
task(':build:components:ngc', ['build:components'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigPath]
));
