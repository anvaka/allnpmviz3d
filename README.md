allnpmviz3d
===========

Npm universe in 3d. `106,317` packages, `235,887` connections, single graph.

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
