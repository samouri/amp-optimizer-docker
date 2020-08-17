/**
 *
 */

const AmpOptimizer = require("@ampproject/toolbox-optimizer");
const ampOptimizer = AmpOptimizer.create(getOptions());

const express = require("express");
const app = express();

const port = 3000;

app.use(express.text());
app.use(express.json());

const opts = {};
if (process.env.CANONICAL) {
  opts.canonical = process.env.CANONICAL;
}

app.post("/", (req, res) => {
  const originalHtml = req.body;
  console.error("requesting");
  if (!req.body) {
    res.status = 400;
    res.send("Error: please provide html in the body of your post request.");
    return;
  }
  if (opts.verbose) {
    console.log(`Transforming html: ${originalHtml}`);
  }
  ampOptimizer
    .transformHtml(originalHtml, opts)
    .then(optimizedHtml => {
      res.set("Content-Type", "text/html");
      res.send(optimizedHtml);
    })
    .catch(err => {
      console.error(err);

      res.status = 500;
      res.set("Content-Type", "text/plain");
      res.send(`Error: ${err.message}`);
    });
});

app.listen(port, () => {
  console.log(`AMP Optimizer listening at http://localhost:${port}`);
});

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
}

function getOptions() {
  const opts = {};
  [
    "autoAddMandatoryTags", // defaults true
    "autoExtensionImport", // default true
    "format", // default AMP
    "fetch", // TODO: remove, cannot specify function.
    "experimentEsm",
    "imageBasePath", // default undefined. valid arg is a string.
    "imageOptimizer", // TODO: remove, cannot specify function.
    "lts", // default false
    "markdown", // default false
    "minify", // default true
    "preloadHeroImage", // default true
    "verbose" // default false
  ].forEach(option => {
    const snakeCaseOpt = camelToSnakeCase(option);
    if (snakeCaseOpt in process.env) {
      opts[option] = process.env[snakeCaseOpt];
    }
  });

  return opts;
}

process.on("SIGINT", function() {
  process.exit();
});
