# SVGOMG!

[SVGOMG](https://jakearchibald.github.io/svgomg/) is **[SVGO](https://github.com/svg/svgo)**'s **M**issing **G**UI, aiming to expose the majority, if not all the configuration options of SVGO.

# Feature requests

It's early days for this project, so it's missing important features such as code output view & detailed options for each plugin. [Check out the issues](https://github.com/jakearchibald/svgomg/issues) to see what's planned, or suggest ideas of your own!

# Running locally

Install dependencies:

```sh
npm install
```

Run dev server:

```sh
npm run serve
```

Or, run without the offline capabilities:

```sh
npm run serve-no-sw
```

Running without offline capabilities means you get the latest version each time you hit refresh. The dist offline-first mobile serves the cached version first then checks for updates in the background.