/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export default `
.fds-kanban {
	--fds-kanban-gap: 16px;
	--fds-kanban-radius: 8px;
	--fds-kanban-surface: var(--white, #fff);
	--fds-kanban-sunken: var(--gray-100, #f1f2f5);
	--fds-kanban-border: var(--gray-200, #e7e7ed);
	--fds-kanban-text: var(--gray-900, #272833);
	--fds-kanban-muted: var(--gray-600, #6b6c7e);

	display: flex;
	gap: var(--fds-kanban-gap);
	overflow-x: auto;
	padding: 20px 24px 24px;
	scroll-padding: 24px;
}

.fds-kanban__column {
	background-color: var(--fds-kanban-sunken);
	border-radius: var(--fds-kanban-radius);
	display: flex;
	flex: 1 1 0;
	flex-direction: column;
	min-width: 236px;
}

.fds-kanban__column-header {
	align-items: center;
	display: flex;
	gap: 8px;
	padding: 14px 16px 10px;
}

.fds-kanban__column-accent {
	border-radius: 3px;
	flex: 0 0 auto;
	height: 10px;
	width: 10px;
}

.fds-kanban__column-title {
	color: var(--fds-kanban-text);
	flex: 1 1 auto;
	font-size: 0.875rem;
	font-weight: 600;
	letter-spacing: 0.01em;
	margin: 0;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fds-kanban__column-count {
	background-color: var(--fds-kanban-surface);
	border-radius: 999px;
	color: var(--fds-kanban-muted);
	font-size: 0.75rem;
	font-weight: 600;
	line-height: 1;
	padding: 4px 8px;
}

.fds-kanban__column-body {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 10px;
	padding: 2px 12px 14px;
}

.fds-kanban__column-empty {
	border: 1px dashed var(--fds-kanban-border);
	border-radius: 6px;
	color: var(--fds-kanban-muted);
	font-size: 0.8125rem;
	padding: 18px 12px;
	text-align: center;
}

.fds-kanban__column--drop-target {
	box-shadow: inset 0 0 0 2px var(--primary, #0b5fff);
}

.fds-kanban__unsupported {
	color: var(--gray-600, #6b6c7e);
	margin: 0 auto;
	max-width: 520px;
	padding: 48px 24px;
	text-align: center;
}

.fds-kanban__unsupported-title {
	color: var(--gray-900, #272833);
	font-size: 1rem;
	font-weight: 600;
	margin: 0 0 6px;
}

.fds-kanban__unsupported-text {
	font-size: 0.875rem;
	line-height: 1.5;
	margin: 0;
}

.fds-kanban__card {
	background-color: var(--fds-kanban-surface);
	border: 1px solid var(--fds-kanban-border);
	border-radius: 6px;
	box-shadow: 0 1px 2px rgba(39, 40, 51, 0.06);
	display: block;
	padding: 12px 14px 12px;
	position: relative;
	text-align: left;
	transition: box-shadow 0.15s ease, opacity 0.15s ease,
		transform 0.15s ease;
	width: 100%;
}

.fds-kanban__card[draggable='true'] {
	cursor: grab;
}

.fds-kanban__card--dragging {
	cursor: grabbing;
	opacity: 0.45;
}

.fds-kanban__card:focus-visible,
.fds-kanban__card:hover {
	box-shadow: 0 4px 12px rgba(39, 40, 51, 0.12);
	transform: translateY(-1px);
}

.fds-kanban__card-top {
	align-items: flex-start;
	display: flex;
	gap: 8px;
	justify-content: space-between;
}

.fds-kanban__card-title {
	color: var(--fds-kanban-text);
	font-size: 0.875rem;
	font-weight: 600;
	line-height: 1.35;
	margin: 0;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
}

.fds-kanban__card-actions {
	flex: 0 0 auto;
	margin: -4px -6px 0 0;
}

.fds-kanban__card-description {
	color: var(--fds-kanban-muted);
	font-size: 0.8125rem;
	line-height: 1.4;
	margin: 6px 0 0;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.fds-kanban__card-labels {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 10px;
}

.fds-kanban__chip {
	background-color: var(--fds-kanban-sunken);
	border-radius: 4px;
	color: var(--fds-kanban-muted);
	font-size: 0.6875rem;
	font-weight: 600;
	letter-spacing: 0.02em;
	padding: 3px 7px;
	text-transform: uppercase;
}

.fds-kanban__chip--priority-critical {
	background-color: var(--danger-l1, #fdeff0);
	color: var(--danger-d1, #b32229);
}

.fds-kanban__chip--priority-high {
	background-color: var(--warning-l1, #fff6e5);
	color: var(--warning-d1, #b95000);
}

.fds-kanban__chip--priority-medium {
	background-color: var(--info-l1, #e7f2ff);
	color: var(--info-d1, #0b5fff);
}

.fds-kanban__card-footer {
	align-items: center;
	border-top: 1px solid var(--fds-kanban-border);
	display: flex;
	gap: 8px;
	justify-content: space-between;
	margin-top: 12px;
	padding-top: 10px;
}

.fds-kanban__assignee {
	align-items: center;
	display: flex;
	gap: 7px;
	min-width: 0;
}

.fds-kanban__avatar {
	align-items: center;
	background-color: var(--primary, #0b5fff);
	border-radius: 999px;
	color: #fff;
	display: flex;
	flex: 0 0 auto;
	font-size: 0.6875rem;
	font-weight: 700;
	height: 24px;
	justify-content: center;
	width: 24px;
}

.fds-kanban__assignee-name {
	color: var(--fds-kanban-muted);
	font-size: 0.75rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fds-kanban__meta {
	align-items: center;
	color: var(--fds-kanban-muted);
	display: flex;
	flex: 0 0 auto;
	font-size: 0.75rem;
	gap: 10px;
}

.fds-kanban__meta-item {
	align-items: center;
	display: flex;
	gap: 4px;
	white-space: nowrap;
}

.fds-kanban__meta-item--overdue {
	color: var(--danger, #da1414);
	font-weight: 600;
}

.fds-kanban__points {
	background-color: var(--fds-kanban-sunken);
	border-radius: 4px;
	font-weight: 600;
	padding: 2px 6px;
}
`;
