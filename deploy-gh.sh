#!/bin/bash
rm -rf dist || exit 0;
gulp build
( cd dist
 git init
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force git@github.com:anvaka/allnpmviz3d.git master:gh-pages
)
