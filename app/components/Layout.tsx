import React, { useEffect, useState } from 'react'
import { Affix } from 'antd'
import { WebViewConfHandlerEnum } from '../../src/types/Dto'

export default () => {
	const options = [-1, 1]
	const handleReloadWebview = (signal: WebViewConfHandler) => {
		vscode.postMessage(signal)
	}

	return (
		<Affix offsetTop={0}>
			<div
				style={{
					backgroundColor: 'grey',
					// 居中
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
				{Object.values(WebViewConfHandlerEnum).map((item, index1) => (
					<div
						key={`${index1}`}
						style={{
							display: 'inline-block',
						}}>
						{item}
						{options.map((option, index2) => (
							<button
								key={`${index1}-${index2}`}
								style={{
									display: 'inline-block',
								}}
								onClick={() => {
									handleReloadWebview({ target: item, option })
								}}>
								{option > 0 ? '+' : '-'}
							</button>
						))}
					</div>
				))}
			</div>
		</Affix>
	)
}
