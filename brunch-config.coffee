module.exports = config:
  files:
    javascripts: joinTo:
      'libraries.js': /^(?!app.js\/)/
      'app.js': /^app\//
    stylesheets: joinTo: 'app.css'
  overrides:
    dev:
      sourceMaps: true
