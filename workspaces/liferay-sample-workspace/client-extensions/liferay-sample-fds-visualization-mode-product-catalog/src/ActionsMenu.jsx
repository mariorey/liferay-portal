/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useEffect, useRef, useState} from 'react';

import {runItemAction} from './fds';

/**
 * Renders the data set's own item actions. The menu is local to this
 * component, but every action is declared by the data set and executed through
 * the data set's callbacks.
 *
 * PROVISIONAL: a plain dropdown instead of `@clayui/drop-down`, so that the
 * bundle stays dependency-free. A real client extension would import Clay from
 * the import map.
 */
export default function ActionsMenu({actions, fdsContext, item, label}) {
	const [open, setOpen] = useState(false);

	const containerRef = useRef(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		const onDocumentClick = (event) => {
			if (!containerRef.current?.contains(event.target)) {
				setOpen(false);
			}
		};

		document.addEventListener('click', onDocumentClick);

		return () => document.removeEventListener('click', onDocumentClick);
	}, [open]);

	if (!actions.length) {
		return null;
	}

	return (
		<div className="dropdown" ref={containerRef}>
			<button
				aria-haspopup="true"
				aria-label={label}
				className="btn btn-sm btn-monospaced btn-unstyled"
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

					setOpen((wasOpen) => !wasOpen);
				}}
				type="button"
			>
				<svg
					aria-hidden="true"
					className="lexicon-icon"
					focusable="false"
					height="16"
					viewBox="0 0 512 512"
					width="16"
				>
					<circle cx="256" cy="106" fill="currentColor" r="48" />

					<circle cx="256" cy="256" fill="currentColor" r="48" />

					<circle cx="256" cy="406" fill="currentColor" r="48" />
				</svg>
			</button>

			{open && (
				<div className="dropdown-menu show" style={{right: 0}}>
					{actions.map((action, index) => (
						<button
							className="dropdown-item"
							disabled={action.disabled}
							key={action.id ?? index}
							onClick={(event) => {
								event.stopPropagation();

								setOpen(false);

								runItemAction({action, event, fdsContext, item});
							}}
							type="button"
						>
							{action.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
