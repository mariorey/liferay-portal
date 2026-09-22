/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useContext, useMemo, useState} from 'react';

import ActionsMenu from './ActionsMenu';
import {
	getFirstValue,
	getItemActions,
	injectStyleSheet,
	runItemAction,
	toText,
} from './fds';
import styles from './styles';

/**
 * LPD-43793 — Kanban board visualization mode.
 *
 * The data set keeps owning data fetching, search, filters, pagination and
 * actions. This component only owns the layout: it takes the page of items the
 * data set just fetched and lays them out in workflow columns.
 *
 * Moving a card between columns is never implicit. It happens through the
 * kebab menu or by dragging the card onto another column, and either way the
 * work is done by an action the data set declared — this component only picks
 * which one to run.
 */

const COLUMNS = [
	{accent: '#8f9baf', key: 'backlog', label: 'Backlog'},
	{accent: '#0b5fff', key: 'inProgress', label: 'In Progress'},
	{accent: '#8b5cf6', key: 'inReview', label: 'In Review'},
	{accent: '#da1414', key: 'blocked', label: 'Blocked'},
	{accent: '#287d3c', key: 'done', label: 'Done'},
];

const COLUMN_KEYS = new Set(COLUMNS.map(({key}) => slug(key)));

/**
 * PROVISIONAL: the field names are discovered from the item instead of being
 * configured. The real visualization mode gets an explicit mapping from the
 * Data Set Manager (LPD-9599), so a board can be pointed at any object.
 */
const FIELDS = {
	assignee: ['assignee', 'owner', 'author'],
	description: ['description', 'summary', 'details'],
	dueDate: ['dueDate', 'endDate', 'deadline'],
	labels: ['labels', 'tags', 'component'],
	priority: ['priority', 'severity'],
	reference: ['reference', 'ticket', 'code', 'key'],
	status: ['taskStatus', 'status', 'state', 'workflowStatus', 'stage'],
	storyPoints: ['storyPoints', 'points', 'estimate'],
	title: ['title', 'name', 'label', 'subject'],
};

injectStyleSheet('fds-kanban-styles', styles);

export default function KanbanBoard({
	frontendDataSetContext,
	items = [],
	itemsActions,
}) {
	const fdsContext = useContext(frontendDataSetContext);

	const [dragging, setDragging] = useState(null);
	const [dragOverKey, setDragOverKey] = useState(null);

	const {columns, statusField} = useMemo(() => groupItems(items), [items]);

	const actions = getItemActions({
		item: items[0] ?? {},
		itemsActions,
	});

	// A board only makes sense when the items carry a status this component
	// recognizes. Saying so beats rendering one meaningless column.

	const recognized = columns.some(
		({items: columnItems, key}) => COLUMN_KEYS.has(key) && columnItems.length
	);

	if (items.length && !recognized) {
		return (
			<div className="fds-kanban__unsupported">
				<p className="fds-kanban__unsupported-title">
					This data set has no workflow status to group by
				</p>

				<p className="fds-kanban__unsupported-text">
					{`The Kanban board groups items by one of ${FIELDS.status.join(
						', '
					)}, with values matching ${COLUMNS.map(
						({label}) => label
					).join(', ')}.`}
				</p>
			</div>
		);
	}

	const onDrop = (event, column) => {
		event.preventDefault();

		setDragOverKey(null);

		const action = dragging && findColumnAction(actions, column, statusField);

		setDragging(null);

		if (action) {
			runItemAction({action, event, fdsContext, item: dragging.item});
		}
	};

	return (
		<div className="fds-kanban">
			{columns.map((column) => {
				const droppable = Boolean(
					dragging &&
						dragging.columnKey !== column.key &&
						findColumnAction(actions, column, statusField)
				);

				return (
					<section
						aria-label={`${column.label}, ${column.items.length} items`}
						className={`fds-kanban__column${
							dragOverKey === column.key
								? ' fds-kanban__column--drop-target'
								: ''
						}`}
						key={column.key}
						onDragEnter={() => droppable && setDragOverKey(column.key)}
						onDragLeave={(event) =>
							event.currentTarget.contains(event.relatedTarget)
								? null
								: setDragOverKey(null)
						}
						onDragOver={(event) => droppable && event.preventDefault()}
						onDrop={(event) => droppable && onDrop(event, column)}
					>
						<header className="fds-kanban__column-header">
							<span
								className="fds-kanban__column-accent"
								style={{backgroundColor: column.accent}}
							/>

							<h3 className="fds-kanban__column-title">
								{column.label}
							</h3>

							<span className="fds-kanban__column-count">
								{column.items.length}
							</span>
						</header>

						<div className="fds-kanban__column-body">
							{column.items.length ? (
								column.items.map((item, index) => (
									<KanbanCard
										dragging={dragging}
										fdsContext={fdsContext}
										item={item}
										itemsActions={itemsActions}
										key={
											item.id ??
											item.externalReferenceCode ??
											index
										}
										onDragEnd={() => {
											setDragging(null);
											setDragOverKey(null);
										}}
										onDragStart={() =>
											setDragging({
												columnKey: column.key,
												item,
											})
										}
									/>
								))
							) : (
								<p className="fds-kanban__column-empty">
									{droppable ? 'Drop here' : 'Nothing here'}
								</p>
							)}
						</div>
					</section>
				);
			})}
		</div>
	);
}

function KanbanCard({
	dragging,
	fdsContext,
	item,
	itemsActions,
	onDragEnd,
	onDragStart,
}) {
	const actions = getItemActions({item, itemsActions});

	const title = toText(getFirstValue(item, FIELDS.title)) || '(untitled)';
	const description = toText(getFirstValue(item, FIELDS.description));
	const assignee = toText(getFirstValue(item, FIELDS.assignee));
	const priority = toText(getFirstValue(item, FIELDS.priority));
	const dueDate = toText(getFirstValue(item, FIELDS.dueDate));
	const storyPoints = toText(getFirstValue(item, FIELDS.storyPoints));
	const reference = toText(getFirstValue(item, FIELDS.reference));
	const labels = toLabels(getFirstValue(item, FIELDS.labels));

	const isDragging = dragging?.item === item;

	return (
		<article
			className={`fds-kanban__card${
				isDragging ? ' fds-kanban__card--dragging' : ''
			}`}
			draggable={actions.length > 0}
			onDragEnd={onDragEnd}
			onDragStart={(event) => {
				event.dataTransfer.effectAllowed = 'move';

				// Firefox ignores a drag that carries no payload.

				event.dataTransfer.setData('text/plain', title);

				onDragStart();
			}}
		>
			<div className="fds-kanban__card-top">
				<h4 className="fds-kanban__card-title">{title}</h4>

				<div className="fds-kanban__card-actions">
					<ActionsMenu
						actions={actions}
						fdsContext={fdsContext}
						item={item}
						label={`Actions for ${title}`}
					/>
				</div>
			</div>

			{description && (
				<p className="fds-kanban__card-description">{description}</p>
			)}

			{(priority || labels.length > 0) && (
				<div className="fds-kanban__card-labels">
					{priority && (
						<span
							className={`fds-kanban__chip fds-kanban__chip--priority-${slug(
								priority
							)}`}
						>
							{priority}
						</span>
					)}

					{labels.map((label) => (
						<span className="fds-kanban__chip" key={label}>
							{label}
						</span>
					))}
				</div>
			)}

			<footer className="fds-kanban__card-footer">
				<div className="fds-kanban__assignee">
					{assignee ? (
						<>
							<span className="fds-kanban__avatar">
								{initials(assignee)}
							</span>

							<span className="fds-kanban__assignee-name">
								{assignee}
							</span>
						</>
					) : (
						<span className="fds-kanban__assignee-name">
							Unassigned
						</span>
					)}
				</div>

				<div className="fds-kanban__meta">
					{reference && <span>{reference}</span>}

					{dueDate && (
						<span
							className={`fds-kanban__meta-item${
								isOverdue(dueDate)
									? ' fds-kanban__meta-item--overdue'
									: ''
							}`}
						>
							{formatDate(dueDate)}
						</span>
					)}

					{storyPoints && (
						<span className="fds-kanban__points">
							{storyPoints}
						</span>
					)}
				</div>
			</footer>
		</article>
	);
}

/**
 * Finds the data set action that moves an item into the given column, by
 * reading the request body the data set already declared. Nothing is invented
 * client side: when no declared action targets the column, the column is not a
 * drop target.
 */
function findColumnAction(actions, column, statusField) {
	return actions.find((action) => {
		let requestBody;

		try {
			requestBody = JSON.parse(action.data?.requestBody ?? '');
		}
		catch (error) {
			return false;
		}

		if (!requestBody || typeof requestBody !== 'object') {
			return false;
		}

		const value = statusField
			? requestBody[statusField]
			: Object.values(requestBody)[0];

		return value !== undefined && slug(value) === slug(column.key);
	});
}

function groupItems(items) {
	const buckets = new Map(
		COLUMNS.map((column) => [column.key, {...column, items: []}])
	);

	let statusField = null;

	for (const item of items) {
		if (!statusField) {
			statusField =
				FIELDS.status.find(
					(name) => getFirstValue(item, [name]) !== undefined
				) ?? null;
		}

		const status = toText(getFirstValue(item, FIELDS.status));

		const key = matchColumnKey(status);

		if (!buckets.has(key)) {
			buckets.set(key, {
				accent: '#8f9baf',
				items: [],
				key,
				label: status || 'Uncategorized',
			});
		}

		buckets.get(key).items.push(item);
	}

	return {columns: [...buckets.values()], statusField};
}

function matchColumnKey(status) {
	const normalized = slug(status);

	const column = COLUMNS.find(
		({key, label}) => slug(key) === normalized || slug(label) === normalized
	);

	return column ? column.key : normalized || 'uncategorized';
}

function slug(value) {
	return String(value ?? '')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function toLabels(value) {
	if (!value) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.map((entry) => toText(entry)).filter(Boolean);
	}

	return toText(value)
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function initials(name) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');
}

function formatDate(value) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
}

function isOverdue(value) {
	const date = new Date(value);

	return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}
