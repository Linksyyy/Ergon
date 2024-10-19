import { Baileys, locale, proto, server } from './map.js'

proto() // load prototypes
locale() // load locales
const bot = new Baileys('settings/auth')
// auth/ contains auth info to login without scan QR Code again

bot.connect()
server(bot) // start express server

process // "anti-crash" to handle lib instabilities
	.on('uncaughtException', (e) => console.error(e, `Uncaught Excep.:`))
	.on('unhandledRejection', (e: Error) => console.error(e, `Unhandled Rej:`))
	.on('uncaughtExceptionMonitor', (e) => console.error(e, `Uncaught Excep.M.:`))
