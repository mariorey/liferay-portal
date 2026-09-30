/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {IconSelector} from '@clayui/core';
import {ClayIconSpriteContext} from '@clayui/icon';
import React, {useState} from 'react';

interface IFDSVisualizationModeIconSelectorProps {
	portletNamespace: string;
	selectedIcon: string;
	spritemap: string;
}

/**
 * The icon a visualization mode shows in the data set toolbar, picked from the
 * icons the theme actually ships rather than typed from memory. The chosen
 * name still travels as the "thumbnail" form field, so nothing downstream has
 * to know a picker was involved.
 */
export default function FDSVisualizationModeIconSelector({
	portletNamespace,
	selectedIcon,
	spritemap,
}: IFDSVisualizationModeIconSelectorProps) {
	const [icon, setIcon] = useState(selectedIcon);

	return (
		<>
			<input
				name={`${portletNamespace}thumbnail`}
				type="hidden"
				value={icon}
			/>

			<ClayIconSpriteContext.Provider value={spritemap}>
				<IconSelector
					onIconChange={setIcon}
					selectedIcon={icon}
					spritemap={spritemap}
				/>
			</ClayIconSpriteContext.Provider>
		</>
	);
}
