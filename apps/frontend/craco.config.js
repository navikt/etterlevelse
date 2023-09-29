module.exports = {
    style: {
        postcss: {
            mode: 'file',
        }
    },
    // create react app is unmaintained :(
    // this is by no means a good solution (we're basically telling the compiler to ignore cerain warnings)
    // the good solution is to move away from create-react-app
    // https://github.com/facebook/create-react-app/discussions/11767#discussioncomment-2421668
    webpack: {
        configure: {
          ignoreWarnings: [
            function ignoreSourcemapsloaderWarnings(warning) {
              return (
                warning.module &&
                warning.module.resource.includes("node_modules") &&
                warning.details &&
                warning.details.includes("source-map-loader")
              );
            },
          ],
        },
      },
}