/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import {sub} from 'frontend-js-web';
import React from 'react';

interface IViewErrorMessageProps {
	messageKey: string;
	viewLabel?: string;
	viewLabelMessageKey: string;
}

/**
 * Reports that a view could not be shown, in place of the item collection, so
 * the management bar, the pagination and the view selector stay usable and the
 * reader can pick another view.
 */
export default function ViewErrorMessage({
	messageKey,
	viewLabel,
	viewLabelMessageKey,
}: IViewErrorMessageProps) {
	return (
		<ClayAlert
			className="m-4"
			displayType="danger"
			title={Liferay.Language.get('error')}
		>
			{viewLabel
				? sub(Liferay.Language.get(viewLabelMessageKey), viewLabel)
				: Liferay.Language.get(messageKey)}
		</ClayAlert>
	);
}
