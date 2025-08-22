import {
	Browsers,
	isJidBot,
	isJidBroadcast,
	isJidMetaIa,
	isJidNewsletter,
	isJidStatusBroadcast,
	makeCacheableSignalKeyStore,
	makeWASocket,
	useMultiFileAuthState,
	type WASocket,
} from 'baileys'
import postgresAuthState from '../plugin/authState.js'
import { logger } from '../util/proto.js'

export default class Baileys {
	sock!: WASocket
	// sock is the real Baileys connection
	constructor() {}

	async connect() {
		// Use saved session (otherwise you'll need to log in again every time)
		const { state, saveCreds } = process.env.DATABASE_URL
			? await postgresAuthState('ergon') // save auth creds/keys on db
			// using postgresAuthState will avoid MANY problems you will
			// encounter using the file system auth storing
			: await useMultiFileAuthState('conf/auth')
		// it is here just bc you may don't have a postgresql db setted.

		this.sock = makeWASocket({
			auth: {
				creds: state.creds,
				// cache makes the store send/receive msgs faster
				keys: makeCacheableSignalKeyStore(state.keys, logger),
			},
			logger,
			markOnlineOnConnect: false, // your account won't be "online" all the time
			browser: Browsers.macOS('Desktop'),
			syncFullHistory: false,
			shouldSyncHistoryMessage: () => false,
			// ignore useless msgs
			shouldIgnoreJid: (jid: str) =>
				isJidBot(jid) ||
				isJidBroadcast(jid) || isJidNewsletter(jid) ||
				isJidMetaIa(jid) || isJidStatusBroadcast(jid),
		})

		// save login creds
		this.sock.ev.on('creds.update', saveCreds)
		return
	}
}
