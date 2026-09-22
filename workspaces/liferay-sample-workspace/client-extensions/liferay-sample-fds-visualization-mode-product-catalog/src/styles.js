/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export default `
.fds-catalog {
	--fds-catalog-surface: var(--white, #fff);
	--fds-catalog-sunken: var(--gray-100, #f1f2f5);
	--fds-catalog-border: var(--gray-200, #e7e7ed);
	--fds-catalog-text: var(--gray-900, #272833);
	--fds-catalog-muted: var(--gray-600, #6b6c7e);
	--fds-catalog-accent: var(--primary, #0b5fff);

	display: grid;
	gap: 20px;
	grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
	padding: 20px 24px 24px;
}

.fds-catalog__card {
	background-color: var(--fds-catalog-surface);
	border: 1px solid var(--fds-catalog-border);
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
	transition: border-color 0.15s ease, box-shadow 0.15s ease,
		transform 0.15s ease;
}

.fds-catalog__card:hover {
	border-color: var(--fds-catalog-accent);
	box-shadow: 0 8px 24px rgba(39, 40, 51, 0.12);
	transform: translateY(-2px);
}

.fds-catalog__media {
	align-items: center;
	aspect-ratio: 4 / 3;
	background-color: var(--fds-catalog-sunken);
	display: flex;
	justify-content: center;
	overflow: hidden;
	position: relative;
}

.fds-catalog__media img {
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s ease;
	width: 100%;
}

.fds-catalog__card:hover .fds-catalog__media img {
	transform: scale(1.04);
}

.fds-catalog__media-fallback {
	color: var(--fds-catalog-muted);
	font-size: 2rem;
	font-weight: 700;
	letter-spacing: 0.04em;
}

.fds-catalog__badges {
	display: flex;
	flex-direction: column;
	gap: 6px;
	left: 10px;
	position: absolute;
	top: 10px;
}

.fds-catalog__badge {
	border-radius: 4px;
	font-size: 0.6875rem;
	font-weight: 700;
	letter-spacing: 0.04em;
	padding: 4px 8px;
	text-transform: uppercase;
	width: fit-content;
}

.fds-catalog__badge--discount {
	background-color: var(--danger, #da1414);
	color: #fff;
}

.fds-catalog__badge--new {
	background-color: var(--fds-catalog-accent);
	color: #fff;
}

.fds-catalog__card-actions {
	position: absolute;
	right: 6px;
	top: 6px;
	z-index: 1;
}

.fds-catalog__card-actions .btn {
	background-color: rgba(255, 255, 255, 0.92);
	border-radius: 999px;
	box-shadow: 0 1px 4px rgba(39, 40, 51, 0.18);
}

.fds-catalog__body {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 6px;
	padding: 14px 16px 16px;
}

.fds-catalog__eyebrow {
	color: var(--fds-catalog-muted);
	font-size: 0.6875rem;
	font-weight: 600;
	letter-spacing: 0.06em;
	text-transform: uppercase;
}

.fds-catalog__title {
	color: var(--fds-catalog-text);
	font-size: 0.9375rem;
	font-weight: 600;
	line-height: 1.35;
	margin: 0;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.fds-catalog__rating {
	align-items: center;
	color: var(--fds-catalog-muted);
	display: flex;
	font-size: 0.75rem;
	gap: 5px;
}

.fds-catalog__stars {
	color: #f0a30a;
	letter-spacing: 1px;
}

.fds-catalog__price-row {
	align-items: baseline;
	display: flex;
	gap: 8px;
	margin-top: 2px;
}

.fds-catalog__price {
	color: var(--fds-catalog-text);
	font-size: 1.125rem;
	font-weight: 700;
	letter-spacing: -0.01em;
}

.fds-catalog__price-was {
	color: var(--fds-catalog-muted);
	font-size: 0.8125rem;
	text-decoration: line-through;
}

.fds-catalog__stock {
	align-items: center;
	display: flex;
	font-size: 0.75rem;
	font-weight: 600;
	gap: 6px;
	margin-top: 2px;
}

.fds-catalog__stock-dot {
	border-radius: 999px;
	height: 8px;
	width: 8px;
}

.fds-catalog__stock--in {
	color: var(--success-d1, #1f7038);
}

.fds-catalog__stock--in .fds-catalog__stock-dot {
	background-color: var(--success, #287d3c);
}

.fds-catalog__stock--low {
	color: var(--warning-d1, #b95000);
}

.fds-catalog__stock--low .fds-catalog__stock-dot {
	background-color: var(--warning, #e5a00d);
}

.fds-catalog__stock--out {
	color: var(--fds-catalog-muted);
}

.fds-catalog__stock--out .fds-catalog__stock-dot {
	background-color: var(--gray-400, #cdced9);
}

.fds-catalog__footer {
	margin-top: auto;
	padding-top: 12px;
}

.fds-catalog__cta {
	align-items: center;
	background-color: var(--fds-catalog-accent);
	border: 1px solid var(--fds-catalog-accent);
	border-radius: 6px;
	color: #fff;
	display: flex;
	font-size: 0.8125rem;
	font-weight: 600;
	gap: 6px;
	justify-content: center;
	padding: 8px 12px;
	transition: filter 0.15s ease;
	width: 100%;
}

.fds-catalog__cta:hover:not(:disabled) {
	filter: brightness(0.92);
}

.fds-catalog__cta:disabled {
	background-color: var(--fds-catalog-sunken);
	border-color: var(--fds-catalog-border);
	color: var(--fds-catalog-muted);
	cursor: not-allowed;
}
`;
