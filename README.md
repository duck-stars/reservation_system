reservation_system
======================
Simple local app for managing customers reservations.


Set up
------
Run `npm install` to download and install the dependencies.

Building
--------
`npm run build` will build the code in `src` and produce a bundle file in `dist`. It first runs the TypeScript compiler which puts its output in the `build` folder. Then `esbuild` is run to bundle the contents of `build` and out to `dist`.


Running
-------
`npm run run` will run the bundled application. Note, you will have to build it first.


Packaging
---------
`npm run package` will run [Jam Pack NodeGui](https://github.com/sedwards2009/jam-pack-nodegui) with a configuration file to create the relevant packages for the current operating system this is running on. The output appears in `tmp-jam-pack-nodegui/jam-pack-nodegui-work/`.


Configured Scripts
------------------

* `build` - Runs all of the build steps.
* `build-code` - Just run in the TypeScript compiler.
* `build-bundle` - Run `esbuild` to create the output bundle file in `dist`.
* `clean` - Deletes the temporary files in `build` and `dist`.
* `run` - Runs the application from the `dist` folder.
* `package` - Build packages for the application. The output appears in `tmp-jam-pack-nodegui/jam-pack-nodegui-work/`

License
-------

MIT

Author
------

Seyed Yasin Mirhashemi <yasin.st2022@gmail.com>
