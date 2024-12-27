"use strict";

const fs = require("fs").promises;
const esbuild = require("esbuild");
const sass = require("sass");

const HTML_TEMPLATE = ["treemap", "sunburst", "network"];
const PLAIN_TEMPLATE = ["raw-data", "list"];
const ALL_TEMPLATE = [...HTML_TEMPLATE, ...PLAIN_TEMPLATE];

const scssPlugin = {
  name: "scss",
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async (args) => {
      const result = await sass.compileAsync(args.path, {});
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

for (const t of HTML_TEMPLATE) {
  args = args.option(t, {
    describe: `Build ${t} template`,
    boolean: true,
  });
}

args = args.help();

const argv = args.argv;

const templatesToBuild = [];
if (argv.all) {
  templatesToBuild.push(...HTML_TEMPLATE);
} else {
  for (const t of HTML_TEMPLATE) {
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
    tsconfig: "./src/tsconfig.json",
  };

  const { metafile } = await esbuild.build(inputOptions);
  await fs.writeFile(`./metafile.${template}.json`, JSON.stringify(metafile, null, 2));
};

const run = async () => {
  try {
    await Promise.all(HTML_TEMPLATE.map((t) => runBuild(t)));
  } catch (err) {
    console.error(err);
  }
};

run();
