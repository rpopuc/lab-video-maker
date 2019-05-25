const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image'),
    video: require('./robots/video.js'),
}

async function start() {

    //robots.userInput();
    //await robots.text()
    await robots.image()

    content = robots.state.load()
    console.dir(content, {depth: null})
}

start()