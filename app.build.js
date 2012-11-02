({
    appDir: ".",
    baseUrl: "js/src",
    dir: "./build",
    //optimize: "none",
    paths: {
        "jquery": "../lib/jquery-1.8.2"
    },
    modules: [
        {
            name: "start",
            exclude: ["jquery"]
        }
    ]  
})
