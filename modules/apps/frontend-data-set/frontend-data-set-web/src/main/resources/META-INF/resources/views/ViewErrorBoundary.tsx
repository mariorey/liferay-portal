/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import {logError} from '../utils/logError';
import ViewErrorMessage from './ViewErrorMessage';

interface IViewErrorBoundaryProps {
	children: React.ReactNode;
	viewLabel?: string;
}

interface IViewErrorBoundaryState {
	hasError: boolean;
}

/**
 * Keeps a throwing view component from taking the whole frontend data set down
 * with it. A view supplied by a client extension is third party code, so an
 * error inside it must degrade to a message in place of the item collection,
 * leaving the management bar, the pagination and the view selector usable.
 *
 * The boundary is remounted whenever the active view changes, so switching
 * away from a broken view clears the error. It only covers errors thrown while
 * the view renders; a view whose module never loads is handled separately,
 * before the component exists.
 */
export default class ViewErrorBoundary extends React.Component<
	IViewErrorBoundaryProps,
	IViewErrorBoundaryState
> {
	static getDerivedStateFromError(): IViewErrorBoundaryState {
		return {hasError: true};
	}

	constructor(props: IViewErrorBoundaryProps) {
		super(props);

		this.state = {hasError: false};
	}

	componentDidCatch(error: Error): void {
		logError(String(error));
	}

	render() {
		if (this.state.hasError) {
			return (
				<ViewErrorMessage
					messageKey="this-view-was-unable-to-render-these-items"
					viewLabel={this.props.viewLabel}
					viewLabelMessageKey="the-x-view-was-unable-to-render-these-items"
				/>
			);
		}

		return this.props.children;
	}
}
