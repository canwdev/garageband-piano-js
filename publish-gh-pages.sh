yarn run build
cd dist
git init
git add .
git commit -m "update"
git branch -m master gh-pages
git remote add origin https://gitee.com/canwdev/garageband-piano-js.git
git push -f origin gh-pages
