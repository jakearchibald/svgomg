# SVGOMG!

[SVGOMG](https://jakearchibald.github.io/svgomg/) is **[SVGO](https://github.com/svg/svgo)**'s **M**issing **G**UI, aiming to expose the majority, if not all the configuration options of SVGO.

## Feature requests

[Check out the issues](https://github.com/jakearchibald/svgomg/issues) to see what's planned, or suggest ideas of your own!

## Running locally

Install dependencies:

```sh
npm install
```

Run dev server:

```sh
npm run dev
```

## Docker

build the Docker image:

```bash
docker build -t jakearchibald/svgomg .
```

Run the Docker container on the specified port (eg: `8080`):

```bash
docker run --rm -it -p 8080:80 jakearchibald/svgomg
```
