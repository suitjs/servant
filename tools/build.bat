cmd /c jsdoc ./js/servant.js -d docs/deploy/ -t docs/template/ -c docs/template/conf.json -r README.md
cmd /c uglifyjs js/servant.js -o js/servant.min.js
