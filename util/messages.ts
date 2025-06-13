import { AnyMessageContent, downloadMediaMessage, proto } from 'baileys'
import { emojis, getCtx, Msg, msgMeta } from '../map.js'
import { logger } from './proto.js'
import bot from '../wa.js'

export { deleteMessage, editMsg, getMedia, react, send, startTyping }

async function getMedia(msg: Msg, startTyping?: Func) {
	const target = msg.isMedia ? msg : msg.quoted

	if (!target || !target.isMedia) return
	if (startTyping) await startTyping()

	const media = await downloadMediaMessage(msg, 'buffer', {}, {
		reuploadRequest: bot.sock.updateMediaMessage,
		logger,
	})

	return media
}

async function startTyping(this: str) {
	return await bot.sock.sendPresenceUpdate('composing', this)
}

// simple abstraction to send a msg
async function send(this: str, body: str | AnyMessageContent) {
	// reply?: baileys.proto.IWebMessageInfo)
	const text = typeof body === 'string' ? { text: body } : body

	const msg = await bot.sock.sendMessage(
		!this.includes('@') ? this + '@s.whatsapp.net' : this,
		text,
	) //, quote)

	// convert raw msg on cmd context
	return await getCtx(msg!, bot)
}

// simple abstraction to react to a msg
async function react(this: Msg, emoji: str) {
	// @ts-ignore find emojis by name | 'ok' => '✅'
	const text = emojis[emoji] || emoji
	await send.bind(this.chat)({ react: { text, key: this.key } })
	return
}

// simple abstraction to edit a msg
async function editMsg(this: Msg, text: str) {
	const { chat, key } = this
	return await send.bind(chat)({ edit: key, text })
}

// simple abstraction to delete a msg
async function deleteMessage(this: Msg | proto.IMessageKey) {
	const { chat, key } = msgMeta(this, '')
	// get msg metadata

	await send.bind(chat)({ delete: key })
	return
}
