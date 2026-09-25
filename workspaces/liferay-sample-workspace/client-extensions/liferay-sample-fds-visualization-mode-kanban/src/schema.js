/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * The fields this visualization mode reads, declared so that the Data Set
 * Manager can offer a mapping form for them instead of leaving the board to
 * guess. Declaring a schema is optional: a mode that ships without one keeps
 * discovering its own fields, which is what the product catalogue sample does.
 */
export default {
	fields: [
		{
			description:
				'The field the board groups by. Its values name the columns.',
			label: 'Status',
			name: 'status',
			required: true,
			type: 'string',
		},
		{
			description: 'Shown as the card title.',
			label: 'Title',
			name: 'title',
			required: true,
			type: 'string',
		},
		{
			description: 'Shown under the title, trimmed to three lines.',
			label: 'Description',
			name: 'description',
			type: 'string',
		},
		{
			description: 'Shown as the avatar and name in the card footer.',
			label: 'Assignee',
			name: 'assignee',
			type: 'string',
		},
		{
			description: 'Shown as a coloured chip.',
			label: 'Priority',
			name: 'priority',
			type: 'string',
		},
		{
			description: 'Shown in the card footer, in red once it has passed.',
			label: 'Due Date',
			name: 'dueDate',
			type: 'date',
		},
	],
};
