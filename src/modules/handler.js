const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

module.exports = async (client) => {
    // Event handler
    const eventFiles = await globPromise(`${process.cwd()}/src/events/*/*.js`);
    eventFiles.map(event => {
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

    // Command handler
    const commandFiles = await globPromise(`${process.cwd()}/src/commands/*/*.js`);
    commandFiles.map(command => {
        const file = require(command);
        if (!file?.name) return;
        client.commands.set(file.name, file);
        client.arrayOfCommands.push(file);
    });

}