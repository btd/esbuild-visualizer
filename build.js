"use strict";

const fs = require("fs").promises;
const esbuild = require("esbuild");
const sass = require("sass");

const TEMPLATE = ["sunburst", "treemap", "network"];

const sassRender = (opts) => {
  return new Promise((resolve, reject) => {
    sass.render(opts, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const scssPlugin = {
  name: "scss",
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async (args) => {
      const result = await sassRender({ file: args.path });
      return {
        contents: result.css.toString("utf-8"),
        loader: "css",
      };
    });
  },
};

let args = require("yargs")
  .strict()
  .option("all", {
    describe: "Build all templates",
    boolean: true,
  })
  .option("dev", { describe: "Run dev build", boolean: true, default: false });

for (const t of TEMPLATE) {
  args = args.option(t, {
    describe: `Build ${t} template`,
    boolean: true,
  });
}

args = args.help();

const argv = args.argv;

const templatesToBuild = [];
if (argv.all) {
  templatesToBuild.push(...TEMPLATE);
} else {
  for (const t of TEMPLATE) {
    if (argv[t]) {
      templatesToBuild.push(t);
    }
  }
}

const inputPath = (template) => `./src/${template}/index.tsx`;

const runBuild = async (template) => {
  const inputOptions = {
    entryPoints: [inputPath(template)],
    bundle: true,
    outfile: `./dist/lib/${template}.js`,
    format: "iife",
    globalName: "drawChart",
    plugins: [scssPlugin],
    minify: !argv.dev,
    target: ["es2017"],
    jsxFragment: "Fragment",
    jsxFactory: "h",
    metafile: true,
  };

  const { metafile } = await esbuild.build(inputOptions);
  await fs.writeFile(
    `./metafile.${template}.json`,
    JSON.stringify(metafile, null, 2)
  );
};

const run = async () => {
  await Promise.all(TEMPLATE.map((t) => runBuild(t)));
};

run();
