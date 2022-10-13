import React, { useEffect, useState } from 'react'

export default function App() {
	const [messagesFromExtension, setMessagesFromExtension] = useState<Dto>({ texts: [] })

	const handleReloadWebview = (signal = false) => {
		vscode.postMessage(signal)
	}

	const listen = (event: MessageEvent<Dto>) => {
		const message = event.data
		console.log('message from extension', message)
		handleReloadWebview(true)
		setMessagesFromExtension(message)
	}

	useEffect(() => {
		handleReloadWebview(true)
		window.addEventListener('message', listen)

		return () => {
			window.removeEventListener('message', listen)
		}
	}, [])

	return (
		<div>
			{messagesFromExtension.texts.map((message, index) => (
				<div key={index}>{message}</div>
			))}
		</div>
	)
}
