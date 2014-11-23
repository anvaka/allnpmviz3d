Big bang of npm
================

npm is the largest package manager for javascript. [This visualization](http://anvaka.github.io/allnpmviz3d/) gives you a small spaceship to explore the universe from inside. `106,317` stars (packages), `235,887` connections (dependencies).

Use `WASD` keys to move around. If you are browsing this with a modern smartphone - rotate your device around to control the camera (WebGL is required).

Video
=====

[![youtube](http://i.imgur.com/FO1GFHh.png)](https://www.youtube.com/watch?v=ECDjf_Gc1as)

Screenshots
===========

Main cluster of dependencies
![Main cluster](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/npm-all.png)

Near asteroids field
![asteroids](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/npm-asteroids.png)

Main cluster without links
![Main cluster - no links](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/mushrooms.png)

Immediate dependents of [lodash](https://www.npmjs.org/package/lodash)
![lodash dependents](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/lodash-dependents.png)

Direct and indirect dependents of lodash
![lodash all dependents](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/lodash-indirect-dependents.png)

Responsive design:

![npm mobile](https://raw.githubusercontent.com/anvaka/allnpmviz3d/master/images/npm-mobile.PNG)

You can fly using device orientation API - just turn your phone around.

Available commands
==================

Search box searches packages by name and accepts regular expressions. You can type just `.` - to match any symbol. Or `^\d+$` to match all packages with numbers as names.

Search box also accepts commands (must start with a colon):

* `:dependents PACKAGE_NAME` - prints direct dependents of a `PACKAGE_NAME`
* `:dependencies PACKAGE_NAME` - prints direct dependencies of a `PACKAGE_NAME`
* `:alldependents PACKAGE_NAME` - prints both direct and indirect dependents of a `PACKAGE_NAME`
* `:alldependencies PACKAGE_NAME` - prints both direct and indirect dependencies of a `PACKAGE_NAME`
* `:i love npm` - this is supposed to be an easter egg. Since "users don't read", I'm putting it as a plain text in the readme file here. So you, my dear reader, can try it out yourself :).

How is this done?
=================

With love of npm everything is possible. This project is built entirely on npm packages.

I'm using [ngraph](https://github.com/anvaka/ngraph) modules to precomupte 3D graph
layout offline. [angular](https://www.npmjs.org/package/angular) + [an](https://github.com/anvaka/an)
makes a nice commonjs friendly pair. Angluar renders all UI components. [three.js](https://www.npmjs.org/package/three)
is used to render graphics.

Finally, [gulp uses browserify](https://github.com/anvaka/allnpmviz3d/blob/master/gulpfile.js) to produce
browser friendly bundle.

The entry point to an app is [appController](https://github.com/anvaka/allnpmviz3d/blob/master/src/scripts/appController.js)
You can start your exploration there. It bootstraps all key components and provides
messaging between them.


Building locally
================
Run this:

```
git clone https://github.com/anvaka/allnpmviz3d
cd allnpmviz3d
npm install
npm start
```

This will start local dev server, with live reload. You will also need data files.
You can either download them from [gh-pages](https://github.com/anvaka/allnpmviz3d/tree/gh-pages/data)
or generate them yourself with [allnpm module](https://github.com/anvaka/allnpm).
After data is downloaded (`labels.json`, `links.bin`, `positions.bin`) make sure
to place it into `src/data` folder.


I need your feedback
====================

If you'd like to contribute - you are very much welcome. Even if it is something
as small as fixing a typo or my grammar, please do not hesitate to submit a pull request!
