allnpmviz3d
===========

Npm universe in 3d. `106,317` packages, `235,887` connections, single graph.

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

How is this done?
=================

With love of npm everything is possible. This project is built entirey on npm packages.

I'm using [ngraph](https://github.com/anvaka/ngraph) modules to precomupte 3D graph
layout offline. [angular](https://www.npmjs.org/package/angular) + [an](https://github.com/anvaka/an)
makes a nice commonjs friendly pair. Angluar renders all UI components. [three.js](https://www.npmjs.org/package/three)
is used to render graphics.

Finally, [gulp uses browserify](https://github.com/anvaka/allnpmviz3d/blob/master/gulpfile.js) to produce
browser friendly bundle.

The entry point to an app is [appController](https://github.com/anvaka/allnpmviz3d/blob/master/src/scripts/appController.js)
You can start your exploration there. It bootsraps all key components and provides
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
