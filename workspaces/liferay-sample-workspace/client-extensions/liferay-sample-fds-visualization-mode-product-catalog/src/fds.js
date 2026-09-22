/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * Thin helpers over the props and the context a frontend data set hands to a
 * visualization mode. Everything in here only reads what the data set already
 * owns: the current page of items, the declared item actions, and the
 * callbacks that run them.
 *
 * PROVISIONAL (LPD-88794): the real contract is still open. This PoC assumes
 * the component receives `{frontendDataSetContext, items, itemsActions}` as
 * props, which is what `FrontendDataSet.tsx` already passes to its built-in
 * views. Nothing here is meant to survive the spike untouched.
 */

/**
 * Reads a possibly nested, possibly localized field off an item.
 *
 * PROVISIONAL: the built-in views resolve fields through the view schema and
 * `getLocalizedValue`. Rather than reimplementing that, this PoC unwraps the
 * two shapes the sample data actually produces: picklist entries
 * (`{key, name}`) and localized strings (`{en_US: '...'}`).
 */
export function getValue(item, path) {
	if (!item || !path) {
		return undefined;
	}

	const value = path
		.split('.')
		.reduce(
			(accumulator, key) =>
				accumulator === null || accumulator === undefined
					? undefined
					: accumulator[key],
			item
		);

	return unwrap(value);
}

/**
 * Returns the value of the first field name that the item actually carries, so
 * a visualization mode can work against more than one object definition
 * without being configured.
 *
 * PROVISIONAL: a real visualization mode gets an explicit field mapping from
 * the Data Set Manager (LPD-9599) instead of guessing.
 */
export function getFirstValue(item, paths) {
	for (const path of paths) {
		const value = getValue(item, path);

		if (value !== undefined && value !== null && value !== '') {
			return value;
		}
	}

	return undefined;
}

/**
 * Reduces the shapes a Liferay object entry can hold to something renderable.
 *
 * An entry mixes plain values with wrappers: picklist entries arrive as
 * `{key, name}`, the workflow status as `{code, label, label_i18n}`, and
 * localized text as a map of language id to string. Anything left over is not
 * renderable, so it is reported as absent rather than handed to JSX, where an
 * object child throws and takes the whole data set down with it.
 */
export function unwrap(value) {
	if (value === null || value === undefined) {
		return undefined;
	}

	if (Array.isArray(value)) {
		return value;
	}

	if (typeof value !== 'object') {
		return value;
	}

	if ('key' in value || 'name' in value) {
		return toPrimitive(value.name ?? value.key);
	}

	if ('label_i18n' in value || 'label' in value) {
		return toPrimitive(value.label_i18n ?? value.label);
	}

	return getLocalizedValue(value);
}

function getLocalizedValue(value) {
	const themeDisplay =
		typeof Liferay === 'undefined' ? null : Liferay.ThemeDisplay;

	const languageId = themeDisplay
		? themeDisplay.getBCP47LanguageId()
		: 'en-US';

	return toPrimitive(
		value[languageId.replace('-', '_')] ?? value[languageId] ?? value.en_US
	);
}

function toPrimitive(value) {
	if (value === null || value === undefined || typeof value === 'object') {
		return undefined;
	}

	return value;
}

/**
 * Coerces anything bound for JSX into a string, so an unexpected shape degrades
 * to empty text instead of throwing.
 */
export function toText(value) {
	if (value === null || value === undefined) {
		return '';
	}

	if (typeof value === 'object') {
		return '';
	}

	return String(value);
}

/**
 * Flattens the data set's item actions into a plain list this component can
 * render however it wants, keeping the data set in charge of what each action
 * actually does.
 */
export function getItemActions({item, itemsActions}) {
	const actions = (itemsActions?.length && itemsActions) ||
		item.actionDropdownItems ||
		[];

	return actions
		.flatMap((action) =>
			action.type === 'group' || action.type === 'contextual'
				? action.items || []
				: [action]
		)
		.filter((action) => !action.isVisible || action.isVisible(item));
}

/**
 * Runs a data set item action through the data set's own callbacks.
 *
 * PROVISIONAL: `frontend-data-set-web` already exports `formatActionURL` and
 * `handleActionClick`, but they are not reachable from a client extension
 * bundle today, so the handful of targets the demo data uses are reimplemented
 * here. Resolving how a client extension reaches these helpers is one of the
 * open questions in LPD-88794.
 */
export function runItemAction({action, event, fdsContext, item}) {
	if (!action) {
		return;
	}

	const {data, href, method, onClick, target} = action;

	const url = formatActionURL(href, item);

	if (onClick) {
		onClick({event, itemData: item});

		return;
	}

	if (target === 'sidePanel') {
		event.preventDefault();

		fdsContext.openSidePanel({
			size: 'lg',
			title: data?.title,
			url,
		});
	}
	else if (target?.includes('modal')) {
		event.preventDefault();

		fdsContext.openModal({size: data?.size || 'lg', title: data?.title, url});
	}
	else if (target === 'async' || target === 'headless') {
		event.preventDefault();

		fdsContext.executeAsyncItemAction({
			errorMessage: data?.errorMessage,
			method: method ?? data?.method,
			requestBody: data?.requestBody,
			successMessage: data?.successMessage,
			url,
		});
	}
	else if (target === 'blank') {
		event.preventDefault();

		window.open(url, '_blank');
	}
	else if (url) {
		event.preventDefault();

		window.location.href = url;
	}
}

function formatActionURL(href, item) {
	if (!href) {
		return href;
	}

	return href.replace(/\{([^}]+)\}/g, (match, field) => {
		const value = getValue(item, field);

		return value === undefined ? match : encodeURIComponent(value);
	});
}

/**
 * Injects a stylesheet once per page. A `fdsVisualizationMode` client
 * extension only declares a JavaScript URL, so the CSS travels inside the
 * bundle.
 *
 * PROVISIONAL: the type could grow a `cssURLs` property like `customElement`
 * has, which would make this unnecessary.
 */
export function injectStyleSheet(id, css) {
	if (document.getElementById(id)) {
		return;
	}

	const styleElement = document.createElement('style');

	styleElement.id = id;
	styleElement.textContent = css;

	document.head.appendChild(styleElement);
}
