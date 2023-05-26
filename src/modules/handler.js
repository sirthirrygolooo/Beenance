const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

module.exports = async (client) => {

    // Event handler
    const events = await globPromise(`${process.cwd()}/src/events/*/*.js`);
    events.map(event => {
        const file = require(event);
        if (file.name) {
            try {
                file.once
                    ? client.once(file.name, (...args) => file.run(...args, client))
                    : client.on(file.name, (...args) => file.run(...args, client));
            }
            catch (err) {
                console.error(err);
            }
        }
    });

    // Command Handler
    const commands = await globPromise(`${process.cwd()}/src/commands/*/*.js`);
    client.arrayOfCommands = [];
    commands.map(command => {
        const file = require(command);
        if (!file?.name) return;
        client.commands.set(file.name, file);
        client.arrayOfCommands.push(file);
    });
}