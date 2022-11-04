import React, { useEffect, useRef, useState } from 'react'
import DefaultConf from '../../src/DefaultConf'
import { WebViewConfHandlerEnum } from '../../src/types/Dto'
import Layout from './Layout'

export default () => {
	const [dto, setDto] = useState<Dto>({ text: '', scrollPos: 0, maxLine: 0, style: DefaultConf.preview! })
	let lastDto = dto

	const handleReloadWebview = (signal: WebViewConfHandler) => {
		vscode.postMessage(signal)
	}

	const listen = (event: MessageEvent<Dto>) => {
		const message = event.data
		if (message.text) {
			lastDto = message
			setDto(message)
		} else {
			setDto({ ...lastDto, style: message.style })
		}
		// 获取页面高度
		const { scrollHeight } = document.body
		window.scrollTo(0, (scrollHeight * message.scrollPos) / message.maxLine)
	}

	useEffect(() => {
		handleReloadWebview({ /* 这个参数随便*/ target: WebViewConfHandlerEnum.fontSize, option: 0 })
		window.addEventListener('message', listen)
		return () => {
			window.removeEventListener('message', listen)
		}
	}, [])

	return (
		<>
			<Layout />
			{dto.text
				.split('\n')
				.join('\r')
				.split('\r\r')
				.join('\r')
				.split('\r')
				.map((text) => text.trim())
				.map((message, index) => {
					if (message) {
						return (
							<>
								{/* 插入dto.style.fontSize倍行距 */}
								<div key={'spaceLine' + index} style={{ height: dto.style.fontSize * dto.style.spaceLines }} />
								<div
									key={'paragraph' + index}
									style={{
										fontSize: dto.style.fontSize,
									}}>
									{`${'\u00A0'.repeat(dto.style.indentionLength)}${message}`}
								</div>
							</>
						)
					}
				})}
		</>
	)
}
